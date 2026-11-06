<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TimeEntryReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'desde' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'hasta' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
            'usuarioId' => ['sometimes', 'nullable', 'integer', 'exists:usuarios,id'],
            'proyectoId' => ['sometimes', 'nullable', 'string', 'max:100'],
            'facturable' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
