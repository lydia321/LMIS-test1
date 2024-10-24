import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_REGIONS = gql`
  query REGIONS {
    base_regions {
      id
      name
    }
  }
`;

const GET_ZONES = gql`
  query GET_ZONES($where: base_zone_bool_exp) {
    base_zone(where: $where) {
      id
      name
    }
  }
`;

const GET_WOREDA = gql`
  query GET_WOREDA($where: base_woreda_bool_exp) {
    base_woreda(where: $where) {
      id
      name
    }
  }
`;

const CREATE_OSSC = gql`
  mutation CreateOSSC(
    $osccName: String!,
    $description: String!,
    $houseNumber: String!,
    $phoneNumber: String!,
    $zoneId: uuid!,
    $woredaId: uuid!
  ) {
    insert_oscc_center(objects: {
      oscc_name: $osccName,
      description: $description,
      house_number: $houseNumber,
      phone_number: $phoneNumber,
      zone_id: $zoneId,
      woreda_id: $woredaId
    }) {
      returning {
        id
        oscc_name
      }
    }
  }
`;

const CreateOSSCForm = ({ isOpen, onClose }) => {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [selectedWoredaId, setSelectedWoredaId] = useState('');
  const [formData, setFormData] = useState({
    osccName: '',
    description: '',
    houseNumber: '',
    phoneNumber: ''
  });

  const { data: regionsData, loading: loadingRegions, error: regionsError } = useQuery(GET_REGIONS);

  // Fetch zones based on the selected region
  const { data: zonesData, loading: loadingZones, error: zonesError } = useQuery(GET_ZONES, {
    variables: {
      where: {
        region_id: { _eq: selectedRegionId }
      }
    },
    skip: !selectedRegionId, 
  });

  // Fetch woredas based on the selected zone
  const { data: woredasData, loading: loadingWoredas, error: woredasError } = useQuery(GET_WOREDA, {
    variables: {
      where: {
        zone_id: { _eq: selectedZoneId }
      }
    },
    skip: !selectedZoneId, 
  });

  // Mutation for submitting the form
  const [createOSSC, { loading: submitting, error: submitError }] = useMutation(CREATE_OSSC, {
    onCompleted: (data) => {
      console.log('OSSC Center created:', data);
      onClose(); // Close the modal upon success
    },
    onError: (error) => {
      console.error('Error creating OSSC:', error);
    }
  });

  if (!isOpen) return null; // Don't render if the modal is closed

  const handleSubmit = (e) => {
    e.preventDefault();
    createOSSC({
      variables: {
        osccName: formData.osccName,
        description: formData.description,
        houseNumber: formData.houseNumber,
        phoneNumber: formData.phoneNumber,
        zoneId: selectedZoneId,
        woredaId: selectedWoredaId
      }
    });
  };

  const handleRegionChange = (event) => {
    const regionId = event.target.value;
    setSelectedRegionId(regionId);
    setSelectedZoneId(''); 
    setSelectedWoredaId(''); 
  };

  const handleZoneChange = (event) => {
    const zoneId = event.target.value;
    setSelectedZoneId(zoneId);
    setSelectedWoredaId(''); 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-6xl relative">
        <button
          onClick={onClose}
          className="absolute text-3xl top-2 right-2 text-red-500 hover:text-red-900"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="text-xl font-semibold m-8"></div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex justify-between">
            <div className="w-1/2 pr-2">
              <label className="block mb-2" htmlFor="osccName">
                OSSC Name *
              </label>
              <input
                type="text"
                id="osccName"
                className="w-full border border-gray-300 p-4 rounded-lg"
                required
                value={formData.osccName}
                placeholder="Enter name"
                onChange={(e) => setFormData({ ...formData, osccName: e.target.value })}
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block mb-2" htmlFor="region">
                Region *
              </label>
              <select
                id="region"
                value={selectedRegionId}
                onChange={handleRegionChange}
                className="w-full border border-gray-300 p-4 rounded-lg"
                required
              >
                <option value="">Select a region</option>
                {loadingRegions && <option>Loading regions...</option>}
                {regionsError && <option>Error loading regions</option>}
                {regionsData && regionsData.base_regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <textarea
              id="description"
              className="w-full border border-gray-300 p-4 rounded-lg"
              rows="4"
              required
              value={formData.description}
              placeholder="Write description"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="mb-4 flex justify-between">
            <div className="w-1/2 pr-2">
              <label className="block mb-2" htmlFor="zone">
                Zone or Sub-city *
              </label>
              <select
                id="zone"
                value={selectedZoneId}
                onChange={handleZoneChange}
                className="w-full border border-gray-300 p-4 rounded-lg"
                required
                disabled={!selectedRegionId}
              >
                <option value="">Select a zone</option>
                {loadingZones && <option>Loading zones...</option>}
                {zonesError && <option>Error loading zones</option>}
                {zonesData && zonesData.base_zone.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2 pl-2">
              <label className="block mb-2" htmlFor="woreda">
                Woreda or District *
              </label>
              <select
                id="woreda"
                value={selectedWoredaId}
                onChange={(e) => setSelectedWoredaId(e.target.value)}
                className="w-full border border-gray-300 p-4 rounded-lg"
                required
                disabled={!selectedZoneId}
              >
                <option value="">Select a woreda</option>
                {loadingWoredas && <option>Loading woredas...</option>}
                {woredasError && <option>Error loading woredas</option>}
                {woredasData && woredasData.base_woreda.map((woreda) => (
                  <option key={woreda.id} value={woreda.id}>
                    {woreda.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 flex justify-between">
            <div className="w-1/2 pr-2">
              <label className="block mb-2" htmlFor="houseNumber">
                House Number *
              </label>
              <input
                type="text"
                id="houseNumber"
                className="w-full border border-gray-300 p-4 rounded-lg"
                required
                value={formData.houseNumber}
                placeholder="Enter house number"
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block mb-2" htmlFor="phoneNumber">
                Phone Number *
              </label>
              <input
                type="text"
                id="phoneNumber"
                className="w-full border border-gray-300 p-4 rounded-lg"
                required
                value={formData.phoneNumber}
                placeholder="Enter phone number"
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          {submitError && (
            <div className="text-red-500 mb-4">
              Error submitting form: {submitError.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-24 py-3 rounded-lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOSSCForm;
