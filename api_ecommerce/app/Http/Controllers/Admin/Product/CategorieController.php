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
        // Verifica si ya existe una categoría con el mismo nombre
        $is_exists = Categorie::where("name", $request->name)->first();

        if ($is_exists) {
            // Retorna error si la categoría ya existe
            return response()->json(["mesagge" => 403]);
        }

        $data = $request->all();

        if ($request->hasFile('icon')) {
            $file = $request->file('icon');

            // Validar que sea cualquier tipo de imagen
            if (!str_starts_with($file->getClientMimeType(), 'image/')) {
                return response()->json([
                    "message" => "El icono debe ser un archivo de imagen válido"
                ], 422);
            }

            // Guardar el archivo
            $data['icon'] = Storage::putFile('categories/icons', $file);
        }


        if ($request->hasFile('image')) {
            $data['image'] = Storage::putFile('categories', $request->file('image'));
        }

        $categorie = Categorie::create($data);

        // Retorna mensaje de éxito
        return response()->json(["mesagge" => 200]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $categorie = Categorie::findorFail($id);
        return response()->json(["categorie" => CategorieResource::make($categorie)]);
    }

    /**
     * Update the specified resource in storage.
     */
   public function update(Request $request, string $id)
{
    $categorie = Categorie::findOrFail($id);

    // Evitar duplicados
    $is_exists = Categorie::where("id", '<>', $id)
        ->where("name", $request->name)
        ->first();

    if ($is_exists) {
        return response()->json(["mesagge" => 403]);
    }

    // Campos básicos a actualizar
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
        if (!str_starts_with($file->getClientMimeType(), 'image/')) {
            return response()->json(["message" => "El icono debe ser un archivo de imagen válido"], 422);
        }
        if ($categorie->icon) Storage::delete($categorie->icon);
        $data["icon"] = Storage::putFile("categories/icons", $file);
    } elseif ($request->icon_delete) {
        if ($categorie->icon) Storage::delete($categorie->icon);
        $data["icon"] = null;
    }

    // Procesar imagen
    if ($request->hasFile("image")) {
        $file = $request->file("image");
        if (!str_starts_with($file->getClientMimeType(), 'image/')) {
            return response()->json(["message" => "La imagen debe ser un archivo de imagen válido"], 422);
        }
        if ($categorie->image) Storage::delete($categorie->image);
        $data["image"] = Storage::putFile("categories", $file);
    } elseif ($request->image_delete) {
        if ($categorie->image) Storage::delete($categorie->image);
        $data["image"] = null;
    }

    // Actualizar la categoría principal
    $categorie->update($data);

    // 🔹 Función recursiva para actualizar estado de todos los hijos
    $this->updateChildStatus($categorie->id, $request->status);

    return response()->json(["mesagge" => 200]);
}

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
