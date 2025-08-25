import { FiMail, FiPhone, FiMapPin, FiCalendar, FiTag, FiStar } from 'react-icons/fi';
import { getPriorityColor } from '../../utils/constants';

/**
 * Contact Information component for profile panel
 * 
 * @param {Object} props - Component props
 * @param {Object} props.contact - Contact data
 * @param {Object} props.profile - Profile data
 * @returns {JSX.Element} Contact info component
 */
const ContactInfo = ({ contact, profile }) => {
  if (!contact) return null;

  const contactInfoItems = [
    {
      icon: FiTag,
      label: 'ID',
      value: contact.id,
      color: 'text-gray-600'
    },
    {
      icon: FiStar,
      label: 'Priority',
      value: contact.priority,
      color: getPriorityColor(contact.priority)
    },
    {
      icon: FiTag,
      label: 'Department',
      value: contact.department || 'Support',
      color: 'text-gray-600'
    },
    {
      icon: FiTag,
      label: 'Platform',
      value: contact.tags?.[0] || 'Webchat',
      color: 'text-gray-600'
    }
  ];

  const profileInfoItems = profile ? [
    {
      icon: FiMail,
      label: 'Email',
      value: profile.email || '-',
      color: 'text-gray-600'
    },
    {
      icon: FiPhone,
      label: 'Phone',
      value: profile.phone || '-',
      color: 'text-gray-600'
    },
    {
      icon: FiMapPin,
      label: 'Location',
      value: profile.location || '-',
      color: 'text-gray-600'
    }
  ] : [];

  return (
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Contact Information Section */}
      <div className="p-6 space-y-6">
        <div>
          <h4 className="font-semibold mb-4 text-black text-lg">Contact Information</h4>
          <div className="space-y-4">
            {contactInfoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color} truncate`}>{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Information Section */}
        {profileInfoItems.length > 0 && (
          <div>
            <h4 className="font-semibold mb-4 text-black text-lg">Profile Details</h4>
            <div className="space-y-4">
              {profileInfoItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                      <p className={`text-sm font-semibold ${item.color} truncate`}>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div>
          <h4 className="font-semibold mb-4 text-black text-lg">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-200 transition-colors">
              <FiPhone className="w-4 h-4" />
              <span>Call</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-200 transition-colors">
              <FiMail className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
