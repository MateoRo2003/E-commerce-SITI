<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slider extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'title',
        'subtitle',
        'label',
        'image',
        'link',
        'status',
        'color',
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
}
