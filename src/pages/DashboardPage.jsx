import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { useQuery, gql } from '@apollo/client';
import ReactPaginate from 'react-paginate';
import CreateOSSCForm from '../components/CreateOSSCForm'; 
import { useAuth } from '../AuthContext'; 
import icon1 from '../assets/icon1.png';
import nav from '../assets/Nav.png';
import logout from '../assets/logout.png';
import emptyState from '../assets/EmptyState.png';

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

  // State to manage search input
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate page offset and limit the displayed data
  const offset = currentPage * itemsPerPage;
  
  // Filter the data based on the search term
  const filteredData = data?.base_ossc.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const paginatedData = filteredData.slice(offset, offset + itemsPerPage);

  // State to manage the popup form visibility
  const [isModalOpen, setModalOpen] = useState(false);

  // Handle pagination page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="h-screen bg-gradient-to-bl from-[#0576e6] to-[#0b3d91] flex flex-col items-center justify-center">
      <div className="absolute top-14 left-0 p-4">
        <img src={icon1} alt="First Image" className="w-10 h-10 mb-24 ml-3" />
        <img src={nav} alt="Second Image" className="w-16 h-12 ml-1" />
      </div>

      <div className="bg-white bg-opacity-15 rounded-3xl p-12 shadow-md w-[92%] h-[90%] ml-20 flex flex-col">
        <div className="flex justify-between items-center mb-6 mt-16">
          <div>
            <label htmlFor="search" className="text-white text-4xl font-semibold mb-5">
              OSSC Center Lists
            </label>
            <div className="relative mt-7">
              <AiOutlineSearch className="absolute right-12 top-3 text-blue-600" />
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search OSSC by Name"
                className="pl-2 pr-14 py-2 rounded-md text-gray-700 bg-white shadow-md"
              />
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)} 
            className="bg-white text-[#0575E6] text-[20px] px-14 pb-1 rounded-md shadow-md font-semibold"
          >
            <span className="text-[28px] font-bold">+</span> Create OSSC
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading && <div className="text-center text-white text-xl">Loading...</div>}
          {error && (
            <div className="text-center">
              <img src={emptyState} alt="Error loading documents" className="mx-auto" />
            </div>
          )}
          {!loading && filteredData.length === 0 && (
            <div className="text-center text-white text-xl mx-auto font-bold">
              No matching documents
              <div className="text-white text-md mt-2 font-light">Try a different search term</div> 
            </div>
          )}

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

        {filteredData.length > itemsPerPage && (
          <div className="flex justify-end mt-4">
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              pageCount={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={handlePageClick}
              containerClassName={"flex list-none"}
              pageClassName={"mx-1 px-3 py-1 text-white hover:bg-blue-500 hover:text-white cursor-pointer"}
              previousClassName={"mx-1 px-3 py-1 text-white hover:bg-blue-500 cursor-pointer"}
              nextClassName={"mx-1 px-3 py-1 text-white hover:bg-blue-500 cursor-pointer"}
              activeClassName={"bg-blue-500 text-white"}
              pageRangeDisplayed={6}
              marginPagesDisplayed={0}
              forcePage={currentPage}
            />
          </div>
        )}

        <div className="absolute top-18 right-16 flex items-center">
          <div className="flex items-center mr-6">
            <div className="w-10 h-10 rounded-full bg-white mr-2"></div> 
            <span className="text-white text-xl">{userEmail || 'User'}</span>
          </div>
          <button className="text-white text-2xl mr-6" onClick={() => navigate('/')}>
            <img src={logout} alt="Logout" className="w-6 h-6" />
          </button>
        </div>
      </div>

      <CreateOSSCForm isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;
