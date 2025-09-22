<?php

namespace App\Http\Controllers\Admin;

use App\Models\Slider;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class SliderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;

        $sliders = Slider::where("title", "like", "%" . $search . "%")
            ->orderBy("id", "desc")
            ->paginate(15);

        return response()->json([
            "total" => $sliders->total(),
            "sliders" => $sliders->map(function ($slider) {
                return [
                    "id" => $slider->id,
                    "titile" => $slider->title,
                    "subtitle" => $slider->subtitle,
                    "label" => $slider->label,
                    "link" => $slider->link,
                    "status" => $slider->status,
                    "image" => env("APP_URL") . "storage/" . $slider->image,
                    "color" => $slider->color,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->all();

        if (!$request->hasFile('image')) {
            return response()->json([
                "message" => "La imagen del slider es obligatoria"
            ], 422);
        }

        $file = $request->file('image');
        if (!str_starts_with($file->getClientMimeType(), 'image/')) {
            return response()->json([
                "message" => "La imagen del slider debe ser un archivo de imagen válido"
            ], 422);
        }

        // Detectar tipo de imagen y crear recurso GD
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
                return response()->json(["message" => "Tipo de imagen no soportado"], 422);
        }

        // Crear imagen true color con transparencia si aplica
        $trueColorImg = imagecreatetruecolor(imagesx($img), imagesy($img));
        imagealphablending($trueColorImg, false);
        imagesavealpha($trueColorImg, true);
        $transparent = imagecolorallocatealpha($trueColorImg, 0, 0, 0, 127);
        imagefill($trueColorImg, 0, 0, $transparent);
        imagecopy($trueColorImg, $img, 0, 0, 0, 0, imagesx($img), imagesy($img));
        imagedestroy($img);
        $img = $trueColorImg;

        // Guardar WebP
        $filename = uniqid('slider_') . '.webp';
        $path = 'sliders/' . $filename;
        $fullPath = storage_path('app/public/' . $path);

        if (!file_exists(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        imagewebp($img, $fullPath, 80);
        imagedestroy($img);

        $data['image'] = $path;

        // Eliminar imagen anterior si existe
        if (isset($data['old_image']) && Storage::exists($data['old_image'])) {
            Storage::delete($data['old_image']);
        }

        $slider = Slider::create($data);

        return response()->json([
            "message" => 200,
            "slider" => $slider
        ]);
    }

    public function update(Request $request, string $id)
    {
        $slider = Slider::findOrFail($id);
        $data = $request->all();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if (!str_starts_with($file->getClientMimeType(), 'image/')) {
                return response()->json([
                    "message" => "La imagen del slider debe ser un archivo de imagen válido"
                ], 422);
            }

            // Eliminar imagen anterior si existe
            if ($slider->image && Storage::exists('public/' . $slider->image)) {
                Storage::delete('public/' . $slider->image);
            }

            // Detectar tipo de imagen y crear recurso GD
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
                    return response()->json(["message" => "Tipo de imagen no soportado"], 422);
            }

            // Crear imagen true color con transparencia si aplica
            $trueColorImg = imagecreatetruecolor(imagesx($img), imagesy($img));
            imagealphablending($trueColorImg, false);
            imagesavealpha($trueColorImg, true);
            $transparent = imagecolorallocatealpha($trueColorImg, 0, 0, 0, 127);
            imagefill($trueColorImg, 0, 0, $transparent);
            imagecopy($trueColorImg, $img, 0, 0, 0, 0, imagesx($img), imagesy($img));
            imagedestroy($img);
            $img = $trueColorImg;

            // Guardar como WebP
            $filename = uniqid('slider_') . '.webp';
            $path = 'sliders/' . $filename;
            $fullPath = storage_path('app/public/' . $path);

            if (!file_exists(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
            }

            imagewebp($img, $fullPath, 80);
            imagedestroy($img);

            $data['image'] = $path;
        }

        $slider->update($data);

        return response()->json([
            "message" => 200,
            "slider" => $slider
        ]);
    }
    public function show(string $id)
    {
        $slider = Slider::findorFail($id);
        return response()->json([
            "slider" => [
                "id" => $slider->id,
                "titile" => $slider->title,
                "subtitle" => $slider->subtitle,
                "label" => $slider->label,
                "link" => $slider->link,
                "status" => $slider->status,
                "image" => env("APP_URL") . "storage/" . $slider->image,
                "color" => $slider->color,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $slider = Slider::findorFail($id);
        $slider->delete();
        return response()->json(["mesagge" => 200]);
    }
}
