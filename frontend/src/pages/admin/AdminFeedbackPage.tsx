import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FeedbackSummary, FeedbackItem } from '../../types';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AdminFeedbackPage: React.FC = () => {
  const [data, setData] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.getFeedbacks();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const averageRating = data?.averageRating || 5.0;
  const distribution = data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const filteredItems = items.filter((f) => {
    const matchesRating = selectedRating === 'ALL' || f.rating === selectedRating;
    const matchesSearch =
      f.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const fiveStarPercentage = totalCount > 0 ? Math.round(((distribution[5] || 0) / totalCount) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Customer Satisfaction
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
            Student Feedback & Dining Ratings
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Review food quality scores, student reviews, and service feedback across campus dining halls.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          className="p-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-ink-secondary hover:text-ink-primary transition-all shadow-sm self-start sm:self-auto"
          title="Refresh Reviews"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards & Satisfaction Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main CSAT Score Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-glass-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-2">
              Overall Experience Rating
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-ink-primary tracking-tight">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-ink-secondary font-medium mt-1">
                  Based on {totalCount} verified dining reviews
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-ink-secondary font-medium">Delight Score</span>
            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {fiveStarPercentage}% 5-Star Reviews
            </span>
          </div>
        </div>

        {/* Rating Distribution Progress */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-glass-sm flex flex-col justify-center space-y-3">
          <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">
            Star Rating Distribution
          </span>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-14 font-semibold text-ink-primary shrink-0">
                  <span>{stars}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-12 text-right font-bold text-ink-secondary text-[11px] shrink-0">
                  {count} ({Math.round(pct)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-glass-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Rating Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedRating('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRating === 'ALL'
                ? 'bg-ink-primary text-white shadow-sm'
                : 'bg-slate-100 text-ink-secondary hover:text-ink-primary'
            }`}
          >
            All Ratings ({totalCount})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedRating(s)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedRating === s
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <span>{s}</span>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] opacity-80">({distribution[s] || 0})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-ink-secondary animate-pulse">
            Loading student reviews...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-200">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-ink-secondary">No reviews match your selected filter.</p>
          </div>
        ) : (
          filteredItems.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-glass-sm flex flex-col justify-between gap-4 hover:shadow-glass-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200/60 flex items-center justify-center font-bold text-xs text-brand-blue">
                      {review.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-ink-primary leading-tight">
                        {review.userName}
                      </h4>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Meal Purchase
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Star
                        key={st}
                        className={`w-3.5 h-3.5 ${
                          st <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-ink-primary leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  "{review.comments}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-secondary pt-2 border-t border-slate-100">
                <span className="font-mono text-slate-400 font-medium">Order {review.orderId.slice(0, 12)}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(review.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
