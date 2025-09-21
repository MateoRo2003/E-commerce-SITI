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

        // Validar que se haya subido una imagen
        if ($request->hasFile('image')) {
            $file = $request->file('image');

            // Validar que sea una imagen
            if (!str_starts_with($file->getClientMimeType(), 'image/')) {
                return response()->json([
                    "message" => "La imagen del slider debe ser un archivo de imagen válido"
                ], 422);
            }

            // Guardar la imagen en la carpeta 'sliders' (dentro de storage/app)
            $data['image'] = Storage::putFile('sliders', $file);
        } else {
            return response()->json([
                "message" => "La imagen del slider es obligatoria"
            ], 422);
        }

        // Crear el slider en la BD
        $slider = Slider::create($data);

        // Retorna mensaje de éxito
        return response()->json([
            "message" => 200,
            "slider" => $slider
        ]);
    }

    /**
     * Display the specified resource.
     */
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
    public function update(Request $request, string $id)
    {
        $slider = Slider::findOrFail($id);
        if ($slider->image != null) {
            Storage::delete($slider->image);
        }

        $path = Storage::putFile('slider', $request->file('image'));
        $request->request->add(['image' => $path]);

        $slider->update($request->all());
        // Retorna mensaje de éxito
        return response()->json([
            "message" => 200,
            "slider" => $slider
        ]);
    }

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
