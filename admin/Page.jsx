import React, { useEffect, useState } from 'react';
import { FiUser, FiRefreshCw, FiTrash2, FiSearch, FiEdit, FiPlus, FiDownload, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useApi, baseUrl, registerPluginTranslations } from 'coffeebreak';
import { useNotification, useActivities, useMedia } from 'coffeebreak/contexts';
import { useTranslation } from 'react-i18next';
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';
import ptPT from '../locales/pt-PT.json';

const NS = 'speaker-presentation-plugin';
registerPluginTranslations(NS, { en, 'pt-BR': ptBR, 'pt-PT': ptPT });

const API_ENDPOINTS = {
  SPEAKERS: `${baseUrl}/speaker-presentation-plugin/speakers`,
};

const truncateText = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text;

  const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
  const truncated = text.substring(0, lastSpace > 0 ? lastSpace : maxLength);

  return `${truncated}...`;
};

const prepareImageUpload = (formData) => {
  if (formData.image instanceof File) {
    return formData.image;
  }
  return null;
};

const prepareSpeakerData = (formData, imageToUpload) => {
  const speakerData = {
    name: formData.name,
    role: formData.role,
    description: formData.description,
    activity_id: formData.activity_id || null,
    linkedin: formData.linkedin || null,
    facebook: formData.facebook || null,
    instagram: formData.instagram || null,
    youtube: formData.youtube || null,
  };

  if (!imageToUpload && !formData.image_uuid) {
    speakerData.image = null;
  }

  return speakerData;
};

const SocialMediaLinks = ({ links, className = "" }) => {
  const socialIcons = {
    linkedin: {
      icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
      label: "LinkedIn Profile"
    },
    facebook: {
      icon: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
      label: "Facebook Profile"
    },
    instagram: {
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      label: "Instagram Profile"
    },
    youtube: {
      icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
      label: "YouTube Channel"
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {Object.entries(links).map(([platform, url]) =>
        url && (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs"
            aria-label={socialIcons[platform].label}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d={socialIcons[platform].icon} />
            </svg>
          </a>
        )
      )}
    </div>
  );
};

const SOCIAL_MEDIA_PATTERNS = {
  linkedin: {
    pattern: /^https?:\/\/(www\.|[a-z]{2}\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9\u00C0-\u017F\-_%]+(\/)?$/,
    message: 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)'
  },
  facebook: {
    pattern: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9\u00C0-\u017F\-_.%]+(\/)?$/,
    message: 'Please enter a valid Facebook profile URL (e.g., https://facebook.com/username)'
  },
  instagram: {
    pattern: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9\u00C0-\u017F\-_.%]+(\/)?$/,
    message: 'Please enter a valid Instagram profile URL (e.g., https://instagram.com/username)'
  },
  youtube: {
    pattern: /^https?:\/\/(www\.)?(youtube\.com\/(@|channel\/|c\/)[a-zA-Z0-9\u00C0-\u017F\-_%]+|youtu\.be\/[a-zA-Z0-9\u00C0-\u017F\-_%]+)(\/)?$/,
    message: 'Please enter a valid YouTube URL (e.g., https://youtube.com/@username)'
  }
};

const validateSocialMediaUrl = (platform, url) => {
  if (!url) return { isValid: true, message: '' };

  const { pattern, message } = SOCIAL_MEDIA_PATTERNS[platform];
  const isValid = pattern.test(url);

  return {
    isValid,
    message: isValid ? '' : message
  };
};

const SpeakerManagement = () => {
  const { t } = useTranslation(NS);
  const api = useApi();
  const { activities, fetchActivities } = useActivities();
  const { showNotification } = useNotification();
  const { uploadMedia, getMediaUrl } = useMedia();

  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    image: null,
    activity_id: null,
    linkedin: '',
    facebook: '',
    instagram: '',
    youtube: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] = useState(null);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActivity, setFilterActivity] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState('');
  const itemsPerPage = 8;

  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: '',
    onConfirm: null,
  });

  const [errors, setErrors] = useState({});

  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${API_ENDPOINTS.SPEAKERS}/`);

      if (Array.isArray(response.data)) {
        const normalizedSpeakers = response.data.map(speaker => ({
          id: speaker.id,
          name: speaker.name || 'Unnamed Speaker',
          role: speaker.role || '',
          description: speaker.description || '',
          image_uuid: speaker.image,
          activity_id: speaker.activity_id ? Number(speaker.activity_id) : null,
          linkedin: speaker.linkedin || '',
          facebook: speaker.facebook || '',
          instagram: speaker.instagram || '',
          youtube: speaker.youtube || ''
        }));
        setSpeakers(normalizedSpeakers);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = response.data.results || response.data.items || [];
        const normalizedSpeakers = dataArray.map(speaker => ({
          id: speaker.id,
          name: speaker.name || 'Unnamed Speaker',
          role: speaker.role || '',
          description: speaker.description || '',
          image_uuid: speaker.image,
          activity_id: speaker.activity_id ? Number(speaker.activity_id) : null,
          linkedin: speaker.linkedin || '',
          facebook: speaker.facebook || '',
          instagram: speaker.instagram || '',
          youtube: speaker.youtube || ''
        }));
        setSpeakers(normalizedSpeakers);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setSpeakers([]);
      }
    } catch (err) {
      setError('Failed to fetch speakers. Please try again.');

      if (err.response) {
        console.error(`API error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addSpeaker = async (speakerData) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: speakerData.name,
        role: speakerData.role || '',
        description: speakerData.description || '',
        activity_id: speakerData.activity_id || null,
        linkedin: speakerData.linkedin || null,
        facebook: speakerData.facebook || null,
        instagram: speakerData.instagram || null,
        youtube: speakerData.youtube || null,
      };

      const response = await api.post(`${API_ENDPOINTS.SPEAKERS}/`, payload);

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error in addSpeaker:', err);

      if (err.response) {
        console.error(`API Error (${err.response.status}):`, err.response.data);
      }

      const errorMessage = err.response?.data?.detail || 'Failed to add speaker';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateSpeaker = async (id, speakerData) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: speakerData.name,
        role: speakerData.role || '',
        description: speakerData.description || '',
        activity_id: speakerData.activity_id || null,
        linkedin: speakerData.linkedin || null,
        facebook: speakerData.facebook || null,
        instagram: speakerData.instagram || null,
        youtube: speakerData.youtube || null,
      };

      if (speakerData.image === null) {
        payload.image = null;
      } else if (speakerData.image && speakerData.image !== 'keep') {
        payload.image = speakerData.image;
      }

      const response = await api.patch(
        `${API_ENDPOINTS.SPEAKERS}/${id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error in updateSpeaker:', err);

      if (err.response) {
        console.error(`API Error (${err.response.status}):`, err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }

      const errorMessage = err.response?.data?.detail || 'Failed to update speaker';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteSpeaker = async (id) => {
    setLoading(true);
    try {
      await api.delete(`${API_ENDPOINTS.SPEAKERS}/${id}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete speaker';
      setError(errorMessage);

      if (err.response) {
        console.error(`Delete speaker error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        console.error('No response received when deleting speaker:', err.request);
      } else {
        console.error('Error setting up delete speaker request:', err.message);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
    fetchActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      if (files?.[0]) {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      // Validate social media URLs
      if (Object.keys(SOCIAL_MEDIA_PATTERNS).includes(name)) {
        const { isValid, message } = validateSocialMediaUrl(name, value);
        setErrors(prev => ({
          ...prev,
          [name]: isValid ? '' : message
        }));
      }

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleActivitySearch = (e) => {
    setActivitySearchQuery(e.target.value);
    setShowActivityDropdown(true);
  };

  const selectActivity = (activity) => {
    setFormData((prev) => ({
      ...prev,
      activity_id: activity.id,
    }));
    setActivitySearchQuery(activity.name);
    setShowActivityDropdown(false);
  };

  const clearSelectedActivity = () => {
    setFormData((prev) => ({ ...prev, activity_id: null }));
    setActivitySearchQuery('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      description: '',
      image: null,
      activity_id: null,
      linkedin: '',
      facebook: '',
      instagram: '',
      youtube: '',
    });
    setImagePreview(null);
    setActivitySearchQuery('');
    setEditMode(false);
    setEditingSpeakerId(null);

    const fileInput = document.getElementById('speaker-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleShowAddModal = () => {
    resetForm();
    setEditMode(false);
    setShowSpeakerModal(true);
  };

  const handleEdit = (speaker) => {
    const activityName = speaker.activity_id
      ? activities.find((a) => a.id === speaker.activity_id)?.name || ''
      : '';

    setFormData({
      name: speaker.name || '',
      role: speaker.role || '',
      description: speaker.description || '',
      image: null,
      image_uuid: speaker.image_uuid,
      activity_id: speaker.activity_id || null,
      linkedin: speaker.linkedin || '',
      facebook: speaker.facebook || '',
      instagram: speaker.instagram || '',
      youtube: speaker.youtube || '',
    });

    setActivitySearchQuery(activityName);

    if (speaker.image_uuid) {
      setImagePreview(getMediaUrl(speaker.image_uuid));
    } else {
      setImagePreview(null);
    }

    setEditMode(true);
    setEditingSpeakerId(speaker.id);

    setShowSpeakerModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateStep(1)) {
      showNotification('Please fix the errors in the form before submitting', 'error');
      return;
    }

    if (!formData.name.trim()) {
      showNotification('Speaker name is required', 'error');
      return;
    }

    showNotification(`${editMode ? 'Updating' : 'Adding'} speaker...`, 'info');

    try {
      const imageToUpload = prepareImageUpload(formData);
      const speakerData = prepareSpeakerData(formData, imageToUpload);

      const result = editMode
        ? await updateSpeaker(editingSpeakerId, speakerData)
        : await addSpeaker(speakerData);

      if (!result.success) {
        showNotification(result.error || `Failed to ${editMode ? 'update' : 'add'} speaker`, 'error');
        return;
      }

      if (result.success && imageToUpload) {
        await handleImageUpload(result.data.image, imageToUpload);
      }

      showNotification(`Speaker ${editMode ? 'updated' : 'added'} successfully!`, 'success');
      resetForm();
      setShowSpeakerModal(false);
      await fetchSpeakers();

    } catch (error) {
      console.error('Speaker submission error:', error);
      showNotification(`An error occurred while ${editMode ? 'updating' : 'adding'} the speaker`, 'error');
    }
  };

  const uploadSpeakerImage = async (imageUuid, imageFile) => {
    try {
      await uploadMedia(imageUuid, imageFile, true);
      showNotification('Image uploaded successfully', 'success');
    } catch (putError) {
      console.error('PUT failed, trying with POST:', putError);

      try {
        await uploadMedia(imageUuid, imageFile, false);
        showNotification('Image uploaded successfully', 'success');
      } catch (postError) {
        console.error('Both PUT and POST failed:', postError);
        showNotification('Speaker saved, but image upload failed', 'warning');
      }
    }
  };

  const handleImageUpload = async (imageUuid, imageFile) => {
    if (!imageUuid) {
      console.error('No image UUID received from API');
      showNotification('Error: No image UUID received from API', 'error');
      return;
    }

    if (!(imageFile instanceof File)) {
      console.error('Invalid file object:', imageFile);
      showNotification('Error: Invalid file object', 'error');
      return;
    }

    await uploadSpeakerImage(imageUuid, imageFile);
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmModal({
      show: true,
      message,
      onConfirm,
    });
  };

  const handleDelete = (id) => {
    showConfirmation(
      'Are you sure you want to delete this speaker?',
      async () => {
        const result = await deleteSpeaker(id);
        if (result.success) {
          showNotification('Speaker deleted successfully!', 'success');
          await fetchSpeakers();
        } else {
          showNotification(result.error || 'Failed to delete speaker', 'error');
        }
      }
    );
  };

  const handleRemoveImage = async () => {
    if (formData.image_uuid) {
      try {
        await api.delete(`${baseUrl}/media/${formData.image_uuid}`);
      } catch (err) {
        console.error('Error removing image:', err);
      }
    } else {
      showNotification('No image to remove', 'info');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const exportSpeakers = () => {
    const exportData = speakers.map(speaker => ({
      name: speaker.name,
      description: speaker.description,
      activity: activities.find(a => a.id === speaker.activity_id)?.name || '',
      image_url: speaker.image_uuid ? getMediaUrl(speaker.image_uuid) : '',
      linkedin: speaker.linkedin || '',
      facebook: speaker.facebook || '',
      instagram: speaker.instagram || '',
      youtube: speaker.youtube || ''
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'speakers-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const moveSpeaker = async (index, direction) => {
    const newSpeakers = [...sortedSpeakers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSpeakers.length) return;

    [newSpeakers[index], newSpeakers[targetIndex]] = [newSpeakers[targetIndex], newSpeakers[index]];

    const updates = newSpeakers.map((speaker, idx) => ({
      id: speaker.id,
      order: idx
    }));

    try {
      await api.post(`${API_ENDPOINTS.SPEAKERS}/reorder`, updates);
      showNotification(t('speakers.reorderSuccess'), 'success');
      await fetchSpeakers();
    } catch (error) {
      console.error('Error reordering speakers:', error);
      showNotification(t('speakers.reorderError'), 'error');
    }
  };

  const filteredSpeakers = Array.isArray(speakers)
    ? speakers.filter(speaker => {
      const matchesSearch = searchQuery === '' ||
        speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (speaker.description?.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type-safe activity comparison (handle both number and string activity_id)
      const matchesActivity = filterActivity === null ||
        speaker.activity_id === filterActivity ||
        (speaker.activity_id && Number(speaker.activity_id) === filterActivity);

      return matchesSearch && matchesActivity;
    })
    : [];

  const sortedSpeakers = [...filteredSpeakers].sort((a, b) => {
    let fieldA = a[sortField === 'description' ? 'description' : sortField];
    let fieldB = b[sortField === 'description' ? 'description' : sortField];

    if (sortField === 'activity') {
      fieldA = activities.find(act => act.id === a.activity_id)?.name || '';
      fieldB = activities.find(act => act.id === b.activity_id)?.name || '';
    }

    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil((sortedSpeakers?.length || 0) / itemsPerPage);
  const paginatedSpeakers = sortedSpeakers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name) newErrors.eventName = 'Event name is required';
        if (!formData.description) newErrors.description = 'Description is required';
        break;
      case 2:
        // Image is optional, so no validation needed
        break;
      case 3:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (!formData.location) newErrors.location = 'Location is required';
        break;
    }

    // Validate social media URLs if they are not empty
    Object.keys(SOCIAL_MEDIA_PATTERNS).forEach(platform => {
      if (formData[platform]) {
        const { isValid, message } = validateSocialMediaUrl(platform, formData[platform]);
        if (!isValid) {
          newErrors[platform] = message;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-2 text-lg">{t('speakers.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="alert alert-error mb-4">
          <FiRefreshCw className="w-6 h-6" />
          <span>{t('speakers.error.fetch')}</span>
        </div>
        <button className="btn btn-primary" onClick={fetchSpeakers}>
          <FiRefreshCw className="mr-2" />
          {t('speakers.tryAgain')}
        </button>
      </div>
    );
  }

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(activitySearchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('speakers.title')}</h1>
        <div className="flex gap-2">
          <button onClick={exportSpeakers} className="btn btn-outline">
            <FiDownload className="mr-2" />
            {t('speakers.export')}
          </button>
          <button onClick={handleShowAddModal} className="btn btn-primary">
            <FiPlus className="mr-2" />
            {t('speakers.addSpeaker')}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="form-control flex-1">
          <div className="input-group">
            <input
              type="text"
              placeholder={t('speakers.searchPlaceholder')}
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <select
          className="select select-bordered max-w-xs"
          value={filterActivity || ''}
          onChange={(e) => setFilterActivity(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">{t('speakers.allActivities')}</option>
          {activities.map(activity => (
            <option key={activity.id} value={activity.id}>{activity.name}</option>
          ))}
        </select>
      </div>

      {showSpeakerModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? t('speakers.modal.editTitle') : t('speakers.modal.addTitle')}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mb-4">
                <label htmlFor="speaker-name" className="label">
                  <span className="label-text">{t('speakers.modal.name')}</span>
                </label>
                <input
                  id="speaker-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('speakers.modal.namePlaceholder')}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control w-full mb-4">
                <label htmlFor="speaker-role" className="label">
                  <span className="label-text">{t('speakers.modal.role')}</span>
                </label>
                <input
                  id="speaker-role"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder={t('speakers.modal.rolePlaceholder')}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control w-full mb-4">
                <label htmlFor="speaker-description" className="label">
                  <span className="label-text">{t('speakers.modal.description')}</span>
                </label>
                <textarea
                  id="speaker-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('speakers.modal.descriptionPlaceholder')}
                  className="textarea textarea-bordered w-full h-24"
                  required
                />
              </div>

              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">{t('speakers.modal.socialMedia')}</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder={t('speakers.modal.linkedin')}
                      className={`input input-bordered w-full ${errors.linkedin ? 'input-error' : ''}`}
                    />
                    {errors.linkedin && <p className="text-error text-sm mt-1">{errors.linkedin}</p>}
                  </div>
                  <div>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder={t('speakers.modal.facebook')}
                      className={`input input-bordered w-full ${errors.facebook ? 'input-error' : ''}`}
                    />
                    {errors.facebook && <p className="text-error text-sm mt-1">{errors.facebook}</p>}
                  </div>
                  <div>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder={t('speakers.modal.instagram')}
                      className={`input input-bordered w-full ${errors.instagram ? 'input-error' : ''}`}
                    />
                    {errors.instagram && <p className="text-error text-sm mt-1">{errors.instagram}</p>}
                  </div>
                  <div>
                    <input
                      type="url"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      placeholder={t('speakers.modal.youtube')}
                      className={`input input-bordered w-full ${errors.youtube ? 'input-error' : ''}`}
                    />
                    {errors.youtube && <p className="text-error text-sm mt-1">{errors.youtube}</p>}
                  </div>
                </div>
              </div>

              <div className="form-control w-full mb-4">
                <label htmlFor="activity-search" className="label">
                  <span className="label-text">{t('speakers.modal.activity')}</span>
                </label>
                <div className="relative">
                  <div className="input-group w-full">
                    <input
                      id="activity-search"
                      type="text"
                      value={activitySearchQuery}
                      onChange={handleActivitySearch}
                      onClick={() => setShowActivityDropdown(true)}
                      placeholder={t('speakers.modal.activityPlaceholder')}
                      className="input input-bordered w-full pl-10"
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    {formData.activity_id && (
                      <button
                        type="button"
                        className="btn btn-square btn-sm"
                        onClick={clearSelectedActivity}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {showActivityDropdown && activitySearchQuery && (
                    <ul className="menu dropdown-content z-[2] p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-60 overflow-auto">
                      {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                          <li key={activity.id}>
                            <button
                              type="button"
                              onClick={() => selectActivity(activity)}
                              className="w-full text-left py-2"
                            >
                              {activity.name}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500 py-2 px-4">{t('speakers.modal.noActivities')}</li>
                      )}
                    </ul>
                  )}
                </div>
                {formData.activity_id && (
                  <div className="mt-2">
                    <span className="badge badge-primary flex items-center gap-1">
                      <span className="text-xs opacity-80">{t('speakers.modal.activity')}:</span>
                      {activities.find((a) => a.id === formData.activity_id)?.name || formData.activity_id}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-control w-full mb-6">
                <label htmlFor="speaker-image" className="label flex justify-between">
                  <span className="label-text">{t('speakers.modal.image')}</span>
                  {imagePreview && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }));
                        setImagePreview(null);
                        document.getElementById('speaker-image').value = '';
                        if (editMode) {
                          handleRemoveImage();
                          setFormData(prev => ({ ...prev, image_uuid: null }));
                        }
                      }}
                    >
                      {t('speakers.modal.clearImage')}
                    </button>
                  )}
                </label>

                <div className="flex gap-4 items-start">
                  <div>
                    {imagePreview ? (
                      <div className="avatar mb-2">
                        <div className="w-24 h-24 rounded-full">
                          <img src={imagePreview} alt="Preview" className="object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar mb-2">
                        <div className="w-24 h-24 rounded-full bg-base-300 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-base-content text-xl font-medium leading-none">
                              {formData.name ? getInitials(formData.name) : 'NA'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      id="speaker-image"
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                    />
                    <p className="text-xs text-base-content/70 mt-1">
                      {t('speakers.modal.imageHint')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    resetForm();
                    setShowSpeakerModal(false);
                  }}
                >
                  {t('speakers.modal.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {editMode ? t('speakers.modal.saveChanges') : t('speakers.modal.addSpeaker')}
                </button>
              </div>
            </form>
          </div>
          <button
            className="modal-backdrop"
            onClick={() => setShowSpeakerModal(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSpeakerModal(false);
              }
            }}
            aria-label="Close modal"
          ></button>
        </div>
      )}

      {confirmModal.show && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t('speakers.confirmDelete.title')}</h3>
            <p className="py-4">{t('speakers.confirmDelete.message')}</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setConfirmModal({ show: false, message: '', onConfirm: null });
                  }
                }}
                tabIndex={0}
                aria-label="Cancel confirmation"
              >
                {t('speakers.confirmDelete.cancel')}
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ show: false, message: '', onConfirm: null });
                }}
              >
                {t('speakers.confirmDelete.confirm')}
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setConfirmModal({ show: false, message: '', onConfirm: null });
              }
            }}
            aria-label="Close confirmation modal"
          ></button>
        </div>
      )}

      <div className="card bg-base-100 border-2 border-secondary hover:border-primary shadow-xl transition-all duration-300">
        <div className="card-body">
          {!speakers || speakers.length === 0 ? (
            <div className="text-center py-8">
              <div className="alert alert-info">
                <FiUser className="w-6 h-6" />
                <span>{t('speakers.noSpeakers')}</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="uppercase text-xs font-semibold text-base-content/60">{t('speakers.table.photo')}</th>
                    <th
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      {t('speakers.table.name')} {getSortIndicator('name')}
                    </th>
                    <th
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      {t('speakers.table.role')} {getSortIndicator('role')}
                    </th>
                    <th
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      {t('speakers.table.description')} {getSortIndicator('description')}
                    </th>
                    <th
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('activity')}
                    >
                      {t('speakers.table.activity')} {getSortIndicator('activity')}
                    </th>
                    <th
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('social')}
                    >
                      {t('speakers.table.socialMedia')} {getSortIndicator('social')}
                    </th>
                    <th className="uppercase text-xs font-semibold text-base-content/60">{t('speakers.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedSpeakers) && paginatedSpeakers.map((speaker, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                    return (
                      <tr key={speaker.id}>
                        <td>
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                              {speaker.image_uuid ? (
                                <img
                                  src={getMediaUrl(speaker.image_uuid)}
                                  alt={speaker.name}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<span class="flex h-full w-full items-center justify-center text-lg font-medium">${getInitials(speaker.name)}</span>`;
                                  }}
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-lg font-medium">
                                  {getInitials(speaker.name)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="font-medium">{speaker.name}</td>
                        <td className="text-base-content/70">{speaker.role}</td>
                        <td className="text-base-content/70">{truncateText(speaker.description)}</td>
                        <td className="text-base-content/70">
                          {speaker.activity_id
                            ? activities.find((a) => a.id === speaker.activity_id)?.name ||
                            `Activity #${speaker.activity_id}`
                            : '—'}
                        </td>
                        <td className="text-base-content/70">
                          <SocialMediaLinks
                            links={{
                              linkedin: speaker.linkedin,
                              facebook: speaker.facebook,
                              instagram: speaker.instagram,
                              youtube: speaker.youtube
                            }}
                          />
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveSpeaker(globalIndex, 'up')}
                              className="btn btn-ghost btn-sm btn-square"
                              disabled={globalIndex === 0}
                              aria-label={`Move ${speaker.name} up`}
                            >
                              <FiChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveSpeaker(globalIndex, 'down')}
                              className="btn btn-ghost btn-sm btn-square"
                              disabled={globalIndex === sortedSpeakers.length - 1}
                              aria-label={`Move ${speaker.name} down`}
                            >
                              <FiChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(speaker)}
                              className="btn btn-primary btn-sm"
                              aria-label={`Edit ${speaker.name}`}
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(speaker.id)}
                              className="btn btn-error btn-sm"
                              aria-label={`Delete ${speaker.name}`}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="join">
            {totalPages <= 8 ? (
              <>
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  «
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  »
                </button>
              </>
            ) : (
              <>
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  aria-label="First page"
                >
                  «
                </button>

                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {(() => {
                  const pages = [];
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`join-item btn ${currentPage === i ? 'btn-active' : ''}`}
                        onClick={() => setCurrentPage(i)}
                        aria-label={`Page ${i}`}
                      >
                        {i}
                      </button>
                    );
                  }

                  return pages;
                })()}

                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  ›
                </button>

                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Last page"
                >
                  »
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="go-to-page" className="text-sm text-base-content/70">
              {t('speakers.pagination.goToPage')}:
            </label>
            <input
              id="go-to-page"
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const pageNum = parseInt(goToPage, 10);
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    setCurrentPage(pageNum);
                    setGoToPage('');
                  }
                }
              }}
              placeholder={`1-${totalPages}`}
              className="input input-bordered input-sm w-20"
              aria-label="Go to page number"
            />
            <button
              onClick={() => {
                const pageNum = parseInt(goToPage, 10);
                if (pageNum >= 1 && pageNum <= totalPages) {
                  setCurrentPage(pageNum);
                  setGoToPage('');
                }
              }}
              className="btn btn-sm btn-primary"
              disabled={!goToPage || parseInt(goToPage, 10) < 1 || parseInt(goToPage, 10) > totalPages}
            >
              {t('speakers.pagination.go')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakerManagement;