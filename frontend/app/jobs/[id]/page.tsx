"use client";

import { FreelanceHubShell } from "@/components/freelance-hub/site-shell";
import { JobDetailPage } from "@/components/freelance-hub/pages";
import { mockJobs } from "@/components/freelance-hub/data";
import { useEffect, useState, use } from "react";

function formatBudgetDisplay(min?: string | number | null, max?: string | number | null, jobType?: string | null) {
  const minValue = min === null || min === undefined || min === "" ? null : Number(min);
  const maxValue = max === null || max === undefined || max === "" ? null : Number(max);

  const formattedMin = minValue !== null && !Number.isNaN(minValue) ? minValue.toLocaleString("id-ID") : null;
  const formattedMax = maxValue !== null && !Number.isNaN(maxValue) ? maxValue.toLocaleString("id-ID") : null;

  if (formattedMin && formattedMax) {
    if (formattedMin === formattedMax || /fixed price/i.test(jobType || "")) {
      return formattedMin;
    }

    return `${formattedMin} - ${formattedMax}`;
  }

  return formattedMin || formattedMax || 'Negotiable';
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      let data = null;
      let found = false;
      
      try {
        // Try public endpoint first (for open jobs)
        try {
          const publicRes = await fetch(`${apiBaseUrl}/projects/public/${id}`);
          if (publicRes.ok) {
            data = await publicRes.json();
            found = true;
          }
        } catch (err) {
          console.error('Error fetching from public endpoint:', err);
        }

        // If public endpoint failed, try authenticated endpoint for applied/contract jobs
        if (!found) {
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('lockin_token') : null;
            console.log('Token available:', !!token, 'for job ID:', id);
            
            if (token) {
              const authRes = await fetch(`${apiBaseUrl}/projects/${id}`, {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('Authenticated endpoint response status:', authRes.status);
              
              if (authRes.ok) {
                data = await authRes.json();
                found = true;
                console.log('Successfully fetched from authenticated endpoint, data:', data);
              } else {
                const errorText = await authRes.text();
                console.error('Authenticated endpoint failed:', authRes.status, errorText);
              }
            } else {
              console.warn('No token found in localStorage');
            }
          } catch (err) {
            console.error('Error with authenticated fetch:', err);
          }
        }

        if (data && found) {
          // Normalize data dari API ke format yang diharapkan JobDetailPage
          const normalizedJob = {
            id: data.id,
            title: data.title,
            description: data.description,
            budget: formatBudgetDisplay(data.budget_min, data.budget_max, data.job_type),
            budget_min: data.budget_min,
            budget_max: data.budget_max,
            type: data.job_type || 'Project',
            duration: data.estimated_time || 'TBD',
            skills: Array.isArray(data.skills) ? data.skills : [],
            client: data.client || {
              id: data.client_id,
              name: data.client_name || 'Unknown Client',
              rating: 0,
              verified: true,
              location: 'Remote',
            },
            status: data.status,
            postedAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Baru saja',
            contract_status: data.contract_status || null,
            bid_status: data.bid_status || null,
          };
          console.log('Setting normalized job:', normalizedJob);
          setJob(normalizedJob);
        } else {
          console.warn('No job found from APIs, falling back to mock jobs');
          // Fallback ke mockJobs jika API tidak menemukan job
          const mockJob = mockJobs.find((item) => item.id === Number(id));
          setJob(mockJob || null);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <FreelanceHubShell>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-600">Memuat...</p>
        </div>
      </FreelanceHubShell>
    );
  }

  return (
    <FreelanceHubShell>
      {job ? <JobDetailPage job={job} /> : <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><p className="text-center text-slate-600">Job tidak ditemukan.</p></div>}
    </FreelanceHubShell>
  );
}