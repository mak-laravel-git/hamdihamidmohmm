<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('job_posts')) {
            DB::table('job_posts')
                ->where('salary_range', 'like', 'AED %')
                ->orWhere('salary_range', 'like', '% AED %')
                ->update([
                    'salary_range' => DB::raw("REPLACE(salary_range, 'AED', 'SDG')"),
                ]);
        }

        if (Schema::hasTable('job_seeker_profiles')) {
            DB::table('job_seeker_profiles')
                ->where('expected_salary', 'like', 'AED %')
                ->orWhere('expected_salary', 'like', '% AED %')
                ->update([
                    'expected_salary' => DB::raw("REPLACE(expected_salary, 'AED', 'SDG')"),
                ]);
        }

        if (Schema::hasTable('payments')) {
            DB::table('payments')
                ->where('currency', 'AED')
                ->update(['currency' => 'SDG']);
        }

        if (Schema::hasTable('packages')) {
            DB::table('packages')
                ->where('currency', 'AED')
                ->update(['currency' => 'SDG']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('job_posts')) {
            DB::table('job_posts')
                ->where('salary_range', 'like', 'SDG %')
                ->orWhere('salary_range', 'like', '% SDG %')
                ->update([
                    'salary_range' => DB::raw("REPLACE(salary_range, 'SDG', 'AED')"),
                ]);
        }

        if (Schema::hasTable('job_seeker_profiles')) {
            DB::table('job_seeker_profiles')
                ->where('expected_salary', 'like', 'SDG %')
                ->orWhere('expected_salary', 'like', '% SDG %')
                ->update([
                    'expected_salary' => DB::raw("REPLACE(expected_salary, 'SDG', 'AED')"),
                ]);
        }

        if (Schema::hasTable('payments')) {
            DB::table('payments')
                ->where('currency', 'SDG')
                ->update(['currency' => 'AED']);
        }

        if (Schema::hasTable('packages')) {
            DB::table('packages')
                ->where('currency', 'SDG')
                ->update(['currency' => 'AED']);
        }
    }
};
