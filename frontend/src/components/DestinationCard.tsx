import React, { useState } from 'react';
import { Heart, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DestinationCard as IDestinationCard } from '../types';

interface Props {
  destination: IDestinationCard;
}

export const DestinationCard: React.FC<Props> = ({ destination }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/plan-trip?dest=${destination.name}`)}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={destination.image_url}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition ${
            isLiked 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/80 text-slate-700 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* AI Score Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{destination.ai_score}% Match</span>
        </div>

        {/* Card Title on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-base leading-tight drop-shadow-sm">{destination.name}</h3>
          <p className="text-xs text-slate-200 font-medium">{destination.country}</p>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3.5 flex items-center justify-between bg-white text-xs">
        <div className="flex items-center gap-1 text-slate-700 font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{destination.rating}</span>
        </div>

        <div className="text-slate-500 font-medium">
          Est. <span className="text-blue-600 font-bold text-sm">{destination.avg_cost_inr}</span>
        </div>
      </div>
    </div>
  );
};
