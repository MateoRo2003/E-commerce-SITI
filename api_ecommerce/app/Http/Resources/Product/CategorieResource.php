<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategorieResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resourse->id,
            'name'=> $this->resourse->name,
            'icon'=> $this->resourse->icon,
            'image'=> $this->resourse->image ? env("APP_URL")."storage/".$this->resourse->image : NULL ,//env("APP_URL") :NULL ,
            'categorie_second_id'=> $this->resourse->categorie_second_id,
            "categorie_second" => $this->resourse->categorie_second ? [
                "name" => $this->resourse->categorie_second->name
            ] : NULL,
            'categorie_third_id'=> $this->resourse->categorie_third_id,
            "categorie_third" => $this->resourse->categorie_second ? [
                "name" => $this->resourse->categorie_third->name
            ] : NULL,
            'position'=> $this->resourse->position,
            "create_at" => $this->resourse->created_at->format("Y-m-d H:i:s"),
        ];
    }
}
