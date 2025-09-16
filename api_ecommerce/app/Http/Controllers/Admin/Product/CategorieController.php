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
    // Verifica si ya existe una categoría con el mismo nombre
    $is_exists = Categorie::where("id", '<>', $id)
        ->where("name", $request->name)
        ->first();

    if ($is_exists) {
        // Retorna error si la categoría ya existe
        return response()->json(["mesagge" => 403]);
    }

    $categorie = Categorie::findOrFail($id);
    $data = $request->all();

    // Procesar icono
    if ($request->hasFile("icon")) {
        $file = $request->file("icon");

        // Validar que sea cualquier tipo de imagen
        if (!str_starts_with($file->getClientMimeType(), 'image/')) {
            return response()->json([
                "message" => "El icono debe ser un archivo de imagen válido"
            ], 422);
        }

        // Borrar icono anterior si existe
        if ($categorie->icon) {
            Storage::delete($categorie->icon);
        }

        // Guardar nuevo
        $data["icon"] = Storage::putFile("categories/icons", $file);
    }

    // Procesar imagen
    if ($request->hasFile("image")) {
        // Borrar imagen anterior si existe
        if ($categorie->image) {
            Storage::delete($categorie->image);
        }

        // Guardar nueva
        $data["image"] = Storage::putFile("categories", $request->file("image"));
    }

    // Actualizar con los datos
    $categorie->update($data);

    // Retorna mensaje de éxito
    return response()->json(["mesagge" => 200]);
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
