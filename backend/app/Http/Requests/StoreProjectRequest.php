<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(
            'create',
            Project::class
        ) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'client_id' => [
                'nullable',
                'integer',
                'exists:clientes,id',
            ],

            'code' => [
                'nullable',
                'string',
                'max:255',
            ],

            'color' => [
                'nullable',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'estimated_hours' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999.99',
                'decimal:0,2',
            ],
        ];
    }
}
