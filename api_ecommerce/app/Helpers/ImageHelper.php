<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    /**
     * Convierte y guarda una imagen en WebP, manteniendo transparencia si aplica.
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder Carpeta dentro de storage/app/public
     * @param string $prefix Prefijo para el nombre del archivo
     * @param int $quality Calidad de WebP (0-100)
     * @return string Ruta relativa lista para guardar en BD
     */
    public static function storeImage($file, $folder, $prefix = '', $quality = 80)
    {
        $mime = $file->getClientMimeType();

        // Si es SVG, se guarda tal cual
        if ($mime === 'image/svg+xml') {
            $path = Storage::putFile("public/{$folder}", $file);
            return str_replace('public/', '', $path);
        }

        // Validar que sea cualquier tipo de imagen
        if (!str_starts_with($mime, 'image/')) {
            throw new \Exception('El archivo debe ser una imagen válida');
        }

        // Crear directorio si no existe
        $folderPath = storage_path("app/public/{$folder}");
        if (!file_exists($folderPath)) {
            mkdir($folderPath, 0755, true);
        }

        // Crear la imagen GD según tipo
        $imageInfo = getimagesize($file);
        $imageType = $imageInfo[2];
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $img = imagecreatefromjpeg($file);
                break;
            case IMAGETYPE_PNG:
                $img = imagecreatefrompng($file);
                break;
            case IMAGETYPE_GIF:
                $img = imagecreatefromgif($file);
                break;
            default:
                throw new \Exception('Tipo de imagen no soportado');
        }

        // Forzar truecolor y mantener transparencia si es PNG/GIF
        if (!imageistruecolor($img)) {
            $trueColorImg = imagecreatetruecolor(imagesx($img), imagesy($img));
            imagealphablending($trueColorImg, false);
            imagesavealpha($trueColorImg, true);
            imagecopy($trueColorImg, $img, 0, 0, 0, 0, imagesx($img), imagesy($img));
            imagedestroy($img);
            $img = $trueColorImg;
        }

        $filename = uniqid($prefix) . '.webp';
        $fullPath = $folderPath . '/' . $filename;

        imagewebp($img, $fullPath, $quality);
        imagedestroy($img);

        return "{$folder}/{$filename}";
    }

    /**
     * Elimina una imagen del storage si existe.
     */
    public static function deleteImage($path)
    {
        if ($path && Storage::exists('public/' . $path)) {
            Storage::delete('public/' . $path);
        }
    }
}
