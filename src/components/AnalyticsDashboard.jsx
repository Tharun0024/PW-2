/**
 * @file src/components/AnalyticsDashboard.jsx
 * @description A dashboard to display locally stored analytics data.
 * Provides insights into application usage, performance, and user satisfaction.
 */
import { useState, useEffect, useMemo } from 'react';
import { getAnalyticsEvents, clearAnalyticsData } from '../utils/analytics';

const StatCard = ({ title, value, description }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
  </div>
);

const BarChart = ({ data, title }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-1/3 text-sm text-gray-600 truncate pr-2">{item.label}</div>
          <div className="w-2/3 bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full text-xs text-white text-center leading-4"
              style={{ width: `${item.percentage}%` }}
            >
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActivityTimeline = ({ events }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
            {events.slice(0, 10).map(event => {
                const colors = {
                    AI_QUERY: 'bg-blue-100 text-blue-800',
                    USER_FEEDBACK: 'bg-green-100 text-green-800',
                    ERROR: 'bg-red-100 text-red-800',
                    FEATURE_USAGE: 'bg-indigo-100 text-indigo-800',
                    PAGE_VIEW: 'bg-gray-100 text-gray-800',
                };
                return (
                    <li key={event.id} className="flex items-start text-sm">
                        <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-medium ${colors[event.type] || colors.PAGE_VIEW}`}>
                            {event.type.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500 flex-grow">{new Date(event.timestamp).toLocaleTimeString()} - {event.message || event.question || event.featureName || event.pageName}</span>
                    </li>
                );
            })}
        </ul>
    </div>
);


const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getAnalyticsEvents().reverse()); // Show most recent first
  }, []);

  const stats = useMemo(() => {
    const aiQueries = events.filter(e => e.type === 'AI_QUERY');
    const feedbacks = events.filter(e => e.type === 'USER_FEEDBACK');
    const errors = events.filter(e => e.type === 'ERROR');
    const featureUsage = events.filter(e => e.type === 'FEATURE_USAGE');

    const totalInteractions = aiQueries.length + featureUsage.length;
    const avgResponseTime = aiQueries.length ? Math.round(aiQueries.reduce((acc, q) => acc + q.responseTime, 0) / aiQueries.length) : 0;
    const cacheHitRate = aiQueries.length ? Math.round((aiQueries.filter(q => q.cached).length / aiQueries.length) * 100) : 0;
    const errorRate = totalInteractions ? Math.round((errors.length / totalInteractions) * 100) : 0;
    
    const thumbsUp = feedbacks.filter(f => f.rating === 'up').length;
    const thumbsDown = feedbacks.filter(f => f.rating === 'down').length;
    const satisfactionRate = feedbacks.length ? Math.round((thumbsUp / feedbacks.length) * 100) : 0;

    const questionCounts = aiQueries.reduce((acc, q) => {
        acc[q.question] = (acc[q.question] || 0) + 1;
        return acc;
    }, {});

    const topQuestions = Object.entries(questionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([label, value]) => ({ label, value, percentage: (value / (aiQueries[0] ? questionCounts[Object.keys(questionCounts)[0]] : 1)) * 100 }));

    return { totalInteractions, avgResponseTime, cacheHitRate, errorRate, thumbsUp, thumbsDown, satisfactionRate, topQuestions, featureUsage };
  }, [events]);

  const handleClearData = () => {
      clearAnalyticsData();
      setEvents([]);
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <button onClick={handleClearData} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Clear Data</button>
        </div>
        <p className="text-sm text-gray-600 mb-6">Note: All analytics data is stored locally in your browser and is not sent to any server.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Interactions" value={stats.totalInteractions} description={`${stats.featureUsage.length} feature uses`} />
          <StatCard title="Avg. AI Response Time" value={`${stats.avgResponseTime}ms`} description="Includes cached & API responses" />
          <StatCard title="Cache Hit Rate" value={`${stats.cacheHitRate}%`} description="Instant AI answers" />
          <StatCard title="User Satisfaction" value={`${stats.satisfactionRate}%`} description={`${stats.thumbsUp} 👍 / ${stats.thumbsDown} 👎`} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart data={stats.topQuestions} title="Top 5 Questions" />
            <ActivityTimeline events={events} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
