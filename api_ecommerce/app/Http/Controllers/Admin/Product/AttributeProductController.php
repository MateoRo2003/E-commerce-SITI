<?php

namespace App\Http\Controllers\admin\Product;

use Dom\Attr;
use Illuminate\Http\Request;
use App\Models\Product\Attribute;
use App\Models\Product\Propertie;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redis;

class AttributeProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $attributes = Attribute::where("name", "like", "%" . $search . "%")->orderBy("id", "desc")->paginate(15);

        return response()->json([
            "total" => $attributes->total(),
            "attributes" => $attributes->map(function ($attributes) {
                return [
                    "id" => $attributes->id,
                    "name" => $attributes->name,
                    "type_attribute" => $attributes->type_attribute,
                    "status" => $attributes->status,
                    "created_at" => $attributes->created_at->format("Y-m-d H:i:s"),
                    "properties" => $attributes->properties->map(function ($properties) {
                        return [
                            "id" => $properties->id,
                            "name" => $properties->name,
                            "code" => $properties->code && str_contains($properties->code, 'properties/images')
                                ? env("APP_URL") . "storage/" . $properties->code
                                : $properties->code
                        ];
                    })
                ];
            }),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $isValida = Attribute::where("name", $request->name)->first();

        if ($isValida) {
            return response()->json(["message" => 403]);
        }

        $attributes = Attribute::create($request->all());
        return response()->json([
            "message" => 200,
            "attributes" => [
                "id" => $attributes->id,
                "name" => $attributes->name,
                "type_attribute" => $attributes->type_attribute,
                "status" => $attributes->status,
                "created_at" => $attributes->created_at->format("Y-m-d H:i:s"),
                "properties" => $attributes->properties->map(function ($properties) {
                    return [
                        "id" => $properties->id,
                        "name" => $properties->name,
                        "code" => $properties->code && str_contains($properties->code, 'properties/images')
                            ? env("APP_URL") . "storage/" . $properties->code
                            : $properties->code
                    ];
                })

            ]
        ]);
    }

    public function store_properties(Request $request)
    {
        $isValida = Propertie::where("name", $request->name)
            ->where("attribute_id", $request->attribute_id)
            ->first();

        if ($isValida) {
            return response()->json(["mesagge" => 403]);
        }

        $data = $request->all();

        // Manejo de archivo si existe
        if ($request->hasFile('image')) {
            $file = $request->file('image');

            if (!str_starts_with($file->getClientMimeType(), 'image/')) {
                return response()->json([
                    "message" => "El archivo debe ser una imagen válida"
                ], 422);
            }

            $data['code'] = Storage::putFile('properties/images', $file);
        }

        $propertie = Propertie::create($data);

        return response()->json([
            "mesagge" => 200,
            "propertie" => [
                "id" => $propertie->id,
                "name" => $propertie->name,
                "code" => $propertie->code && str_contains($propertie->code, 'properties/images')
                    ? env("APP_URL") . "storage/" . $propertie->code
                    : $propertie->code,
                "status" => $propertie->status,
                "created_at" => $propertie->created_at->format("Y-m-d H:i:s"),
            ]

        ]);
    }

    public function destroy_properties($id)
    {

        $propertie = Propertie::findOrFail($id);
        $propertie->delete();
        return response()->json(["mesagge" => 200]);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        $isValida = Attribute::where("id", "<>", $id)->where("name", $request->name)->first();

        if ($isValida) {
            return response()->json(["mesagge" => 403]);
        }

        $attributes = Attribute::findOrFail($id);
        $attributes->update($request->all());
        return response()->json([
            "mesagge" => 200,
            "attributes" => [
                "id" => $attributes->id,
                "name" => $attributes->name,
                "type_attribute" => $attributes->type_attribute,
                "status" => $attributes->status,
                "created_at" => $attributes->created_at->format("Y-m-d H:i:s"),
                "properties" => $attributes->properties->map(function ($properties) {
                    return [
                        "id" => $properties->id,
                        "name" => $properties->name,
                        "code" => $properties->code && str_contains($properties->code, 'properties/images')
                            ? env("APP_URL") . "storage/" . $properties->code
                            : $properties->code
                    ];
                })

            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $attributes = Attribute::findOrFail($id);
        $attributes->delete();
        return response()->json(["mesagge" => 200]);
    }
}
