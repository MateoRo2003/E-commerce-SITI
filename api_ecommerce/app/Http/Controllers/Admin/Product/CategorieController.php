<?php

namespace App\Http\Controllers\Admin\Product;

use Illuminate\Http\Request;
use App\Models\Product\Categorie;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Product\CategorieResource;
use App\Http\Resources\Product\CategorieCollection;

class CategorieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $categories = Categorie::where("name", "like", "%" . $search . "%")->orderBy("id", "desc")->paginate(15);

        return response()->json([
            "total" => $categories->total(),
            "categories" => CategorieCollection::make($categories),
        ]);
    }

    public function config()
    {

        $categories_first = Categorie::where("categorie_second_id", NULL)->where("categorie_third_id", NULL)->get();

        $categories_seconds = Categorie::where("categorie_second_id", "<>", NULL)->where("categorie_third_id", NULL)->get();

        return response()->json([
            "categories_first" => $categories_first,
            "categories_seconds" => $categories_seconds,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created resource in storage.
     *
     * Este método maneja la creación de una nueva categoría.
     * 1. Verifica si ya existe una categoría con el mismo nombre.
     * 2. Si existe, retorna un mensaje de error.
     * 3. Si se envía una imagen, la almacena y agrega la ruta al request.
     * 4. Crea la categoría con los datos recibidos.
     * 5. Retorna un mensaje de éxito.
     */
    public function store(Request $request)
    {
        $is_exists = Categorie::where("name", $request->name)->first();
        if ($is_exists) {
            return response()->json(["mesagge" => 403]);
        }

        $data = $request->all();

        // Manejo de icono
        if ($request->hasFile('icon')) {
            $file = $request->file('icon');
            $mime = $file->getClientMimeType();

            if (!str_starts_with($mime, 'image/')) {
                return response()->json([
                    "message" => "El icono debe ser un archivo de imagen válido"
                ], 422);
            }

            // SVG se guarda tal cual
            if ($mime === 'image/svg+xml') {
                $data['icon'] = Storage::putFile('categories/icons', $file);
            } else {
                $data['icon'] = $this->convertImageToWebP($file, 'categories/icons', 'icon_');
            }
        }

        // Manejo de imagen
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $data['image'] = $this->convertImageToWebP($file, 'categories', 'category_');
        }

        $categorie = Categorie::create($data);

        return response()->json(["mesagge" => 200, "categorie" => $categorie]);
    }

    public function update(Request $request, string $id)
    {
        $categorie = Categorie::findOrFail($id);

        $is_exists = Categorie::where("id", '<>', $id)
            ->where("name", $request->name)
            ->first();
        if ($is_exists) {
            return response()->json(["mesagge" => 403]);
        }

        $data = [
            'name' => $request->name,
            'type_categorie' => $request->type_categorie,
            'position' => $request->position,
            'status' => $request->status,
            'categorie_second_id' => filter_var($request->categorie_second_id, FILTER_VALIDATE_INT) ?: null,
            'categorie_third_id' => filter_var($request->categorie_third_id, FILTER_VALIDATE_INT) ?: null,
        ];

        // Procesar icono
        if ($request->hasFile("icon")) {
            $file = $request->file("icon");
            $mime = $file->getClientMimeType();

            if (!str_starts_with($mime, 'image/')) {
                return response()->json(["message" => "El icono debe ser un archivo de imagen válido"], 422);
            }

            if ($categorie->icon) Storage::delete($categorie->icon);

            if ($mime === 'image/svg+xml') {
                $data["icon"] = Storage::putFile("categories/icons", $file);
            } else {
                $data["icon"] = $this->convertImageToWebP($file, 'categories/icons', 'icon_');
            }
        } elseif ($request->icon_delete) {
            if ($categorie->icon) Storage::delete($categorie->icon);
            $data["icon"] = null;
        }

        // Procesar imagen
        if ($request->hasFile("image")) {
            $file = $request->file("image");
            if ($categorie->image) Storage::delete($categorie->image);
            $data["image"] = $this->convertImageToWebP($file, 'categories', 'category_');
        } elseif ($request->image_delete) {
            if ($categorie->image) Storage::delete($categorie->image);
            $data["image"] = null;
        }

        $categorie->update($data);

        // Actualizar estado de hijos
        $this->updateChildStatus($categorie->id, $request->status);

        return response()->json(["mesagge" => 200]);
    }

    /**
     * Helper para convertir cualquier imagen a WebP manteniendo transparencia
     */
    private function convertImageToWebP($file, $folder, $prefix = 'img_')
    {
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
                throw new \Exception("Tipo de imagen no soportado");
        }

        $trueColorImg = imagecreatetruecolor(imagesx($img), imagesy($img));
        imagealphablending($trueColorImg, false);
        imagesavealpha($trueColorImg, true);
        $transparent = imagecolorallocatealpha($trueColorImg, 0, 0, 0, 127);
        imagefill($trueColorImg, 0, 0, $transparent);
        imagecopy($trueColorImg, $img, 0, 0, 0, 0, imagesx($img), imagesy($img));
        imagedestroy($img);
        $img = $trueColorImg;

        $filename = uniqid($prefix) . '.webp';
        $path = $folder . '/' . $filename;
        $fullPath = storage_path('app/public/' . $path);

        if (!file_exists(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        imagewebp($img, $fullPath, 80);
        imagedestroy($img);

        return $path;
    }

    public function show(string $id)
    {
        $categorie = Categorie::findorFail($id);
        return response()->json(["categorie" => CategorieResource::make($categorie)]);
    }

    /**
     * Update the specified resource in storage.
     */

    /**
     * Actualiza recursivamente el status de todos los hijos de una categoría
     */
    private function updateChildStatus($parentId, $status)
    {
        $children = Categorie::where('categorie_second_id', $parentId)
            ->orWhere('categorie_third_id', $parentId)
            ->get();

        foreach ($children as $child) {
            $child->update(['status' => $status]);
            // Llamada recursiva para nietos
            $this->updateChildStatus($child->id, $status);
        }
    }






    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $categorie = Categorie::findorFail($id);
        $categorie->delete();
        //valdiar que la categoria no este en ningun producti
        return response()->json(["mesagge" => 200]);
    }
}
