<?php

namespace App\Models\Product;

use Carbon\Carbon;
use App\Models\Product\Propertie;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribute extends Model
{
     use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'name',
        'type_attribute',
        'status',
    ];


    public function setCreatedAttribute($value)
    {
        date_default_timezone_set("America/Argentina/Buenos_Aires");
        $this->attributes['created_at'] = Carbon::now();
    }
    public function setUpdatedAttribute($value)
    {
        date_default_timezone_set("America/Argentina/Buenos_Aires");
        $this->attributes['updated_at'] = Carbon::now();
    }

    public function properties(){
        return $this->hasMany(Propertie::class);
    }

}
