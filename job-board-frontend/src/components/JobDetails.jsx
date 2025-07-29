import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const JobDetails = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}api/jobs/${id}`
        );
        setJob(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!job) {
    return <div className="container mx-auto p-4">Job not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
      <p className="text-gray-600 mb-2">
        <strong>Company:</strong> {job.company}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Location:</strong> {job.location}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Type:</strong> {job.type}
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
      </p>
      <p>{job.description}</p>
      <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
        Back to Jobs
      </Link>
    </div>
  );
};

export default JobDetails;
