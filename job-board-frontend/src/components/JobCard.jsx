import { Link } from 'react-router-dom';

const JobCard = ({ job }) => (
  <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
    <h3 className="text-xl font-bold">{job.title}</h3>
    <p className="text-gray-600">{job.company}</p>
    <p className="text-gray-500">{job.location} • {job.type}</p>
    <Link to={`/job/${job._id}`} className="text-blue-500 hover:underline mt-2 inline-block">
      View Details
    </Link>
  </div>
);

export default JobCard;