import { useMedia, getApi } from 'coffeebreak/event-app';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FaLinkedin, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

// Enum for display styles
const SpeakerCardStyle = {
  SIMPLE: 'simple',
  DETAILED: 'detailed',
  GRID: 'grid'
};

// Modal component to show speaker details
const SpeakerDetailModal = ({ speaker, onClose }) => {
  const modalRef = useRef(null);
  const { getImage } = useMedia();
  const [imageUrl, setImageUrl] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    // Show modal when component mounts
    modalRef.current?.showModal();

    // Load speaker image if available
    if (speaker.image_id || speaker.image) {
      getImage(speaker.image_id || speaker.image)
        .then(url => setImageUrl(url))
        .catch(() => console.error("Failed to load speaker image"));
    }

    // Fetch activities where this speaker is present
    const fetchSpeakerActivities = async () => {
      try {
        const [speakersRes, activitiesRes] = await Promise.all([
          getApi().get('/speaker-presentation-plugin/speakers/'),
          getApi().get('/activities/')
        ]);

        // Find all speaker entries with the same name (same person might have multiple activities)
        const speakerEntries = speakersRes.data.filter(s => s.name === speaker.name);
        const activityIds = speakerEntries.map(s => s.activity_id).filter(Boolean);

        // Filter activities where this speaker is present
        const speakerActivities = activitiesRes.data.filter(a => activityIds.includes(a.id));
        setActivities(speakerActivities);
      } catch (err) {
        console.error('Error fetching speaker activities:', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchSpeakerActivities();

    // Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const socialLinks = [
    { icon: FaLinkedin, url: speaker.linkedin, label: 'LinkedIn' },
    { icon: FaFacebook, url: speaker.facebook, label: 'Facebook' },
    { icon: FaInstagram, url: speaker.instagram, label: 'Instagram' },
    { icon: FaYoutube, url: speaker.youtube, label: 'YouTube' }
  ].filter(link => link.url);

  return (
    <dialog ref={modalRef} className="modal modal-middle" onClose={onClose}>
      <div className="modal-box max-w-2xl w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[70vw]">
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        
        <div className="flex flex-col md:flex-row rounded-xl gap-4 md:gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl overflow-hidden mx-auto">
              {imageUrl ? (
                <img src={imageUrl} alt={speaker.name} className="w-full rounded-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-primary">{speaker.name}</h2>
            {speaker.role && <p className="text-sm md:text-base italic text-base-content mb-2 md:mb-4">{speaker.role}</p>}
            {speaker.description && (
              <div className="mt-2 mb-4">
                <p className="text-sm md:text-base text-base-content/90">{speaker.description}</p>
              </div>
            )}
            
            {socialLinks.length > 0 && (
              <div className="flex justify-center md:justify-start gap-4 mt-4">
                {socialLinks.map(({ icon: Icon, url, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-circle btn-sm md:btn-md"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4 md:w-6 md:h-6" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activities section */}
        {loadingActivities ? (
          <div className="flex justify-center mt-6">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        ) : activities.length > 0 && (
          <div className="mt-6 border-t border-base-300 pt-4">
            <h3 className="text-lg font-semibold text-primary mb-3">Activities</h3>
            <div className="space-y-2">
              {activities.map(activity => (
                <a
                  key={activity.id}
                  href={`/activity/${activity.id}`}
                  className="block p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <p className="font-medium text-sm sm:text-base">{activity.name}</p>
                  {activity.date && (
                    <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                      {new Date(activity.date).toLocaleString(navigator.language, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

SpeakerDetailModal.propTypes = {
  speaker: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

const SpeakerImage = ({ imageId, speakerName }) => {
  const { getImage, isLoading } = useMedia();
  const [imageUrl, setImageUrl] = useState(null);
  const [loadError, setLoadError] = useState(false);
  
  useEffect(() => {
    if (imageId) {
      getImage(imageId)
        .then(url => setImageUrl(url))
        .catch(() => setLoadError(true));
    } else {
      setLoadError(true);
    }
  }, [imageId, getImage]);
  
  const containerClass = "w-full h-full object-cover";
  
  if (isLoading) {
    return (
      <div className={`${containerClass} bg-base-300 flex items-center justify-center`}>
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }
  
  if (!imageUrl || loadError) {
    return imageId ? (
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(speakerName)}&background=0D8ABC&color=fff&size=256`}
        alt={speakerName}
        className={containerClass}
      />
    ) : (
      <div className={`${containerClass} bg-base-300 flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={speakerName}
      className={containerClass}
    />
  );
};

SpeakerImage.propTypes = {
  imageId: PropTypes.string,
  speakerName: PropTypes.string.isRequired,
};

const Speaker = ({ 
  title = "Speakers",
  description = null,
  display_style = SpeakerCardStyle.SIMPLE,
  activity_id = null,
  speakerId = null
}) => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [filterText, setFilterText] = useState('');

  // Fetch speakers on component mount
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const { data } = await getApi().get('/speaker-presentation-plugin/speakers/');
        setSpeakers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching speakers:', err);
        if (err.response && err.response.status === 401) {
          setError('Please log in to view speakers');
        } else {
          setError(err.message || 'Failed to fetch speakers');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {title && <h2 className="text-2xl font-bold text-primary">{title}</h2>}
        <div className="flex justify-center p-8">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        {title && <h2 className="text-2xl font-bold text-primary">{title}</h2>}
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Filter speakers based on the props
  let filteredSpeakers = speakers;

  // Filter by specific speaker ID if provided
  if (speakerId !== null) {
    filteredSpeakers = speakers.filter(s => s.id === parseInt(speakerId, 10));
  }

  // Filter by activity ID if provided
  if (activity_id !== null) {
    filteredSpeakers = filteredSpeakers.filter(speaker =>
      speaker.activities?.some(activity =>
        activity.id === parseInt(activity_id, 10)
      )
    );
  }

  if (filterText.trim() !== '') {
    filteredSpeakers = filteredSpeakers.filter(speaker =>
      speaker.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }

  const handleSpeakerClick = (speaker) => {
    setSelectedSpeaker(speaker);
  };

  const handleCloseModal = () => {
    setSelectedSpeaker(null);
  };

  const renderSpeakerCard = (speaker) => {
    // Simple card style
    if (display_style === SpeakerCardStyle.SIMPLE) {
      return (
        <button
          key={speaker.id}
          className="bg-base-300 rounded-xl p-3 sm:p-4 flex items-center w-full max-w-md mx-auto hover:shadow-2xl transition-shadow"
          onClick={() => handleSpeakerClick(speaker)}
          aria-label={`View details for ${speaker.name}`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-base-200 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <SpeakerImage
              imageId={speaker.image_id || speaker.image}
              speakerName={speaker.name}
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-base sm:text-lg font-bold text-left">{speaker.name}</h2>
            {speaker.role && (
              <p className="text-sm sm:text-base italic text-base-content/70 text-left">{speaker.role}</p>
            )}
          </div>
        </button>
      );
    }

    // Detailed card style
    if (display_style === SpeakerCardStyle.DETAILED) {
      return (
        <button
          key={speaker.id}
          className="card bg-base-200 shadow-xl lg:card-side cursor-pointer hover:shadow-2xl transition-shadow text-left w-full mx-2 sm:mx-4"
          onClick={() => handleSpeakerClick(speaker)}
          aria-label={`View details for ${speaker.name}`}
        >
          <div className="flex-shrink-0 lg:w-40 xl:w-52 2xl:w-64">
            <figure className="px-2 sm:px-4 py-3 sm:py-4 lg:pl-4 flex justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                <SpeakerImage
                  imageId={speaker.image_id || speaker.image}
                  speakerName={speaker.name}
                />
              </div>
            </figure>
          </div>

          <div className="card-body p-3 sm:p-6">
            <h2 className="card-title text-lg sm:text-xl font-bold">{speaker.name}</h2>
            {speaker.role && <p className="text-sm sm:text-base italic text-base-content/70 mb-2 sm:mb-4">{speaker.role}</p>}
            {speaker.description && <p className="text-sm sm:text-base text-base-content/70">{speaker.description}</p>}
          </div>
        </button>
      );
    }

    // Grid style
    return (
      <button
        key={speaker.id}
        className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform w-full"
        onClick={() => handleSpeakerClick(speaker)}
        aria-label={`View details for ${speaker.name}`}
      >
        <div className="avatar">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
            <SpeakerImage
              imageId={speaker.image_id || speaker.image}
              speakerName={speaker.name}
            />
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-medium mt-2 text-center">{speaker.name}</h3>
        {speaker.role && <p className="text-xs sm:text-sm italic text-base-content/70 mb-2 sm:mb-4">{speaker.role}</p>}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {title && <h2 className="text-xl sm:text-2xl font-bold text-primary text-center w-full pt-2 sm:pt-4">{title}</h2>}
      {description && <p className="text-sm sm:text-base text-base-content/70 px-3 sm:px-6">{description}</p>}
      <div className="mb-2 px-3 sm:px-6">
        <input
          type="text"
          placeholder="Filter by name"
          className="input input-bordered rounded-xl w-full text-sm sm:text-base"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
      </div>
      
      {filteredSpeakers.length === 0 ? (
        <div className="flex items-center justify-center p-4 bg-base-200 rounded-lg">
          <span className="text-base-content/60">No speakers found</span>
        </div>
      ) : (
        <div className={`
          ${display_style === SpeakerCardStyle.GRID ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 px-2 sm:px-4' : 'flex flex-col gap-3 sm:gap-6 px-2 sm:px-4'}
        `}>
          {filteredSpeakers.map(speaker => renderSpeakerCard(speaker))}
        </div>
      )}
      
      {/* Modal for speaker details */}
      {selectedSpeaker && createPortal(
        <SpeakerDetailModal 
          speaker={selectedSpeaker} 
          onClose={handleCloseModal} 
        />,
        document.body
      )}
    </div>
  );
};

Speaker.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  display_style: PropTypes.oneOf(Object.values(SpeakerCardStyle)),
  activity_id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  speakerId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

export default Speaker;