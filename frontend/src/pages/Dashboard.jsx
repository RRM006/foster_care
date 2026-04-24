import { useState, useEffect } from 'react';
import { Users, Heart, Gift, DollarSign, UsersRound, Building2, Activity } from 'lucide-react';
import { stats } from '../api/api';

function Dashboard({ user }) {
  const [statsData, setStatsData] = useState({
    total_children: 0,
    total_guardians: 0,
    total_donors: 0,
    total_donations: 0,
    total_staff: 0,
    total_agencies: 0,
    pending_children: 0,
    in_foster: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await stats.get();
      setStatsData(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Children',
      value: statsData.total_children,
      icon: Users,
      color: 'children'
    },
    {
      label: 'In Foster Care',
      value: statsData.in_foster,
      icon: Heart,
      color: 'guardians'
    },
    {
      label: 'Pending Placement',
      value: statsData.pending_children,
      icon: Activity,
      color: 'donations'
    },
    {
      label: 'Total Donors',
      value: statsData.total_donors,
      icon: Gift,
      color: 'donors'
    },
    {
      label: 'Total Donations',
      value: statsData.total_donations,
      icon: DollarSign,
      color: 'donations'
    },
    {
      label: 'Active Staff',
      value: statsData.total_staff,
      icon: UsersRound,
      color: 'children'
    },
    {
      label: 'Agencies',
      value: statsData.total_agencies,
      icon: Building2,
      color: 'guardians'
    },
    {
      label: 'Guardians',
      value: statsData.total_guardians,
      icon: Heart,
      color: 'donors'
    }
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: '#666' }}>Welcome back, {user?.name}!</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="card stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>About FCMS</h3>
        <p style={{ lineHeight: '1.8', color: '#666' }}>
          The Foster Care Management System (FCMS) is a digital database system designed to help 
          child welfare agencies, social workers, and guardians manage everything in one place. 
          The system stores information about every child, including their name, age, health condition, 
          and education level. It also records details about foster families, guardians, donations, 
          and adoption cases.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-pending">Digital Record Keeping</span>
          <span className="badge badge-in-foster">Quick Placement</span>
          <span className="badge badge-reunified">Health Tracking</span>
          <span className="badge badge-verified">Donor Transparency</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;