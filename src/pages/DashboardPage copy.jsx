import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineArrowLeft } from 'react-icons/ai';
import { useQuery, gql } from '@apollo/client';
import ReactPaginate from 'react-paginate';
import CreateOSSCForm from '../components/CreateOSSCForm'; 
import { useAuth } from '../AuthContext'; 
import icon1 from '../assets/icon1.png'
import nav from '../assets/Nav.png'
import logout from '../assets/logout.png'
import emptyState from '../assets/EmptyState.png'


const GET_BASE_OSSC = gql`
  query GetBaseOSSC {
    base_ossc {
      name
      region {
        name
        zones {
          name
        }
      }
      created_at
    }
  }
`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userEmail } = useAuth(); // Get userEmail from AuthContext

  // Apollo Client hook to query data
  const { loading, error, data } = useQuery(GET_BASE_OSSC);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  // Calculate page offset and limit the displayed data
  const offset = currentPage * itemsPerPage;
  const paginatedData = data?.base_ossc.slice(offset, offset + itemsPerPage) || [];

  // State to manage the popup form visibility
  const [isModalOpen, setModalOpen] = useState(false);

  // Handle pagination page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleCreate = (formData) => {
    console.log('Creating OSSC Center with data:', formData);
    // Add your logic to send formData to the endpoint
    setModalOpen(false); // Close the modal after submission
  };

  return (
    <div className="h-screen  bg-gradient-to-bl from-[#0576e6] to-[#0b3d91] flex flex-col items-center justify-center">
      {/* Left Side - Images */}
      <div className="absolute top-14 left-0 p-4"> {/* Container for images */}
        <img src={icon1} alt="First Image" className="w-10 h-10 mb-24 ml-3" /> {/* Adjust size as needed */}
        <img src={nav} alt="Second Image" className="w-16 h-12 ml-1" /> {/* Adjust size as needed */}
      </div>
      {/* Lighter Blue Section in the middle with gaps */}
      <div className="bg-white bg-opacity-15 rounded-3xl p-12 shadow-md w-[92%] h-[90%] ml-20 flex flex-col">
        {/* Search Bar and Create Button on the Same Line */}
        <div className="flex justify-between items-center mb-6 mt-16">
          {/* OSCC Label and Search Bar */}
          <div>
            <label htmlFor="search" className="text-white text-4xl font-semibold mb-5">
            OSSC Center Lists
            </label>
            <div className="relative mt-7">
              <AiOutlineSearch className="absolute right-12 top-3 text-blue-600" />
              <input
                type="text"
                id="search"
                placeholder="Search OSSC by Name"
                className="pl-2 pr-14 py-2 rounded-md text-gray-700 bg-white shadow-md"
              />
            </div>
          </div>

          {/* Create Button on the Right */}
          <button
            onClick={() => setModalOpen(true)} // Open the form on click
            className="bg-white text-[#0575E6] text-[20px] px-14 pb-1 rounded-md shadow-md font-semibold"
          >
           <span className="text-[28px] font-bold">+</span> Create OSSC
          </button>
        </div>

        {/* Table or No Documents Message */}
        <div className="flex-1 overflow-auto">
          {loading && <div className="text-center text-white text-xl">Loading...</div>}
          {error && <div className="text-center">
            <img src={emptyState} alt="Error loading documents" className="mx-auto"></img>
            </div>}
          {!loading && !data?.base_ossc.length && (
            <div className="text-center text-white text-xl mx-auto font-bold">
              No documents
              <div className="text-white text-md mt-2 font-light">Start creating OSSC data</div> 
              </div>
          )}

          {/* Table of Documents */}
          {paginatedData.length > 0 && (
            <table className="w-full bg-transparent">
              <thead>
                <tr>
                  <th className="text-left text-white px-4 py-2">No</th>
                  <th className="text-left text-white px-4 py-2">OSSC Center Name</th>
                  <th className="text-left text-white px-4 py-2">Region</th>
                  <th className="text-left text-white px-4 py-2">Zone</th>
                  <th className="text-left text-white px-4 py-2">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.name} className="border-b border-dashed">
                    <td className="border-none text-[#EEF2FF] px-1 py-6">{offset + index + 1}</td>
                    <td className="text-[#EEF2FF] border-none text-left px-4 py-6">{item.name}</td>
                    <td className="text-[#EEF2FF] border-none text-left px-4 py-6">{item.region.name}</td>
                    <td className="text-[#EEF2FF] border-none text-left px-4 py-6">
                      {item.region.zones.map((zone) => zone.name).join(', ')}
                    </td>
                    <td className="text-[#EEF2FF] border-none text-left px-4 py-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {data?.base_ossc.length > itemsPerPage && (
          <div className="flex justify-end mt-4">
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              pageCount={Math.ceil(data.base_ossc.length / itemsPerPage)} // Correct page count
              onPageChange={handlePageClick}
              containerClassName={"flex list-none"}
              pageClassName={"mx-1 px-3 py-1 text-white hover:bg-blue-500 hover:text-white cursor-pointer"}
              previousClassName={"mx-1 px-3 py-1 text-white hover:bg-blue-500 cursor-pointer"}
              nextClassName={"mx-1 px-3 py-1 text-white hover:bg-blue-500 cursor-pointer"}
              activeClassName={"bg-blue-500 text-white"} // Filled color for the active page
              pageRangeDisplayed={6} // Show 6 numbers at a time
              marginPagesDisplayed={0} // No margin pages at the edges
              forcePage={currentPage} // Sync current page with selected page
            />
          </div>
        )}
        <div className="absolute top-18 right-16 flex items-center">
        {/* User Profile */}
        <div className="flex items-center mr-6">
          <div className="w-10 h-10 rounded-full bg-white mr-2"></div> {/* Placeholder for round profile picture */}
          <span className="text-white text-xl">{userEmail || 'User'}</span> {/* Display email or fallback to 'User' */}
        </div>

        {/* Back Button */}
        <button
          className="text-white text-2xl mr-6"
          onClick={() => navigate('/')}
        >
          <img src={logout} alt="Logout" className="w-6 h-6" /> {/* Adjust image size as needed */}
          </button>
      </div>
      </div>

      {/* Popup Form for Creating OSSC */}
      <CreateOSSCForm isOpen={isModalOpen} onClose={() => setModalOpen(false)} />

      {/* Right Side - User Info and Back Button */}
      
    </div>
  );
};

export default DashboardPage;
