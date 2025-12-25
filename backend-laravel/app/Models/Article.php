<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'url',
        'excerpt',
        'image_url',
        'is_updated',
        'references',
        'original_article_id',
    ];

    protected $casts = [
        'is_updated' => 'boolean',
        'references' => 'array',
    ];

    // Relationship: Get the original article if this is an updated version
    public function originalArticle()
    {
        return $this->belongsTo(Article::class, 'original_article_id');
    }

    // Relationship: Get updated versions of this article
    public function updatedVersions()
    {
        return $this->hasMany(Article::class, 'original_article_id');
    }
}