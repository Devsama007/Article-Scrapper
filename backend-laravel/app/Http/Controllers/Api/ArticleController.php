<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    /**
     * Display a listing of articles.
     */
    public function index()
    {
        $articles = Article::with(['originalArticle', 'updatedVersions'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }

    /**
     * Store a newly created article.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:500',
            'content' => 'required|string',
            'url' => 'nullable|string|max:500',
            'excerpt' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'is_updated' => 'nullable|boolean',
            'references' => 'nullable|json',
            'original_article_id' => 'nullable|integer|exists:articles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $article = Article::create($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $article,
            'message' => 'Article created successfully'
        ], 201);
    }

    /**
     * Display the specified article.
     */
    public function show($id)
    {
        $article = Article::with(['originalArticle', 'updatedVersions'])->find($id);
        
        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $article
        ]);
    }

    /**
     * Update the specified article.
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);
        
        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:500',
            'content' => 'sometimes|string',
            'url' => 'nullable|string|max:500',
            'excerpt' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'is_updated' => 'nullable|boolean',
            'references' => 'nullable|json',
            'original_article_id' => 'nullable|integer|exists:articles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $article->update($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $article,
            'message' => 'Article updated successfully'
        ]);
    }

    /**
     * Remove the specified article.
     */
    public function destroy($id)
    {
        $article = Article::find($id);
        
        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }
        
        $article->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully'
        ], 200);
    }
}