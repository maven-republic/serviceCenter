import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  DollarSign, 
  Clock, 
  Calendar, 
  Shield, 
  CheckCircle,
  X,
  MessageCircle,
  Eye,
  Award,
  Briefcase
} from 'lucide-react';

const InterestComparisonView = ({ 
  interests = [], 
  onSelectProfessional,
  onRejectProfessional,
  isLoading = false 
}) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const comparableInterests = interests.filter(i => 
    !['withdrawn', 'rejected', 'selected'].includes(i.status)
  );

  const toggleComparison = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else if (prev.length < 3) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  const enterComparisonMode = () => {
    if (selectedInterests.length >= 2) {
      setComparisonMode(true);
    }
  };

  const exitComparisonMode = () => {
    setComparisonMode(false);
    setSelectedInterests([]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getComparisonScore = (interest) => {
    let score = 0;
    
    if (interest.professional?.rating_average) {
      score += (interest.professional.rating_average / 5) * 40;
    }
    
    const responseTime = new Date(interest.created_at) - new Date();
    const fastResponse = responseTime < (2 * 60 * 60 * 1000);
    if (fastResponse) score += 20;
    
    if (interest.professional?.verification_status === 'verified') {
      score += 20;
    }
    
    if (interest.intent === 'high') score += 10;
    else if (interest.intent === 'standard') score += 5;
    
    if (interest.amount && !interest.assessment) score += 10;
    
    return Math.round(score);
  };

  if (comparableInterests.length === 0) {
    return (
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-blue-800 text-sm">
            No professional responses available for comparison yet.
          </div>
        </div>
      </div>
    );
  }

  if (comparisonMode && selectedInterests.length >= 2) {
    const compareInterests = interests.filter(i => selectedInterests.includes(i.interest_id));
    
    return (
      <div className="space-y-6">
        {/* Comparison Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Professional Comparison</h2>
            <p className="text-gray-600">
              Comparing {compareInterests.length} professionals side by side
            </p>
          </div>
          <Button variant="outline" onClick={exitComparisonMode}>
            <X className="h-4 w-4 mr-2" />
            Exit Comparison
          </Button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {compareInterests.map((interest) => (
            <ComparisonCard 
              key={interest.interest_id}
              interest={interest}
              score={getComparisonScore(interest)}
              onSelect={() => onSelectProfessional(interest.interest_id)}
              onReject={() => onRejectProfessional(interest.interest_id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Comparison Summary */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
          <ComparisonSummary interests={compareInterests} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Professionals to Compare</h2>
          <p className="text-gray-600">
            Choose 2-3 professionals to compare side by side
          </p>
        </div>
        
        {selectedInterests.length >= 2 && (
          <Button onClick={enterComparisonMode}>
            Compare {selectedInterests.length} Professionals
          </Button>
        )}
      </div>

      {/* Selection Grid */}
      <div className="grid gap-4">
        {comparableInterests
          .sort((a, b) => getComparisonScore(b) - getComparisonScore(a))
          .map((interest) => (
          <SelectionCard
            key={interest.interest_id}
            interest={interest}
            isSelected={selectedInterests.includes(interest.interest_id)}
            onToggleSelect={() => toggleComparison(interest.interest_id)}
            canSelect={selectedInterests.length < 3 || selectedInterests.includes(interest.interest_id)}
            score={getComparisonScore(interest)}
          />
        ))}
      </div>

      {/* Selection Footer */}
      {selectedInterests.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-600">
            {selectedInterests.length} professional{selectedInterests.length !== 1 ? 's' : ''} selected for comparison
          </span>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setSelectedInterests([])}>
              Clear Selection
            </Button>
            {selectedInterests.length >= 2 && (
              <Button onClick={enterComparisonMode}>
                Compare Selected
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectionCard = ({ 
  interest, 
  isSelected, 
  onToggleSelect, 
  canSelect, 
  score 
}) => {
  const professional = interest.professional;
  const account = professional?.account;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div 
      className={`bg-white rounded-xl p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
      } ${!canSelect ? 'opacity-50' : ''}`}
      onClick={canSelect ? onToggleSelect : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={account?.profile_picture_url} />
              <AvatarFallback>
                {account?.first_name?.[0]}{account?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            {isSelected && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {account?.first_name} {account?.last_name}
              </h3>
              {professional?.verification_status === 'verified' && (
                <Shield className="h-4 w-4 text-green-600" />
              )}
              <Badge variant="outline" className="text-xs">
                {score}% match
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              {professional?.rating_average > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{professional.rating_average}</span>
                </div>
              )}
              
              {interest.amount ? (
                <span className="font-semibold text-green-600">
                  {formatCurrency(interest.amount)}
                </span>
              ) : interest.assessment ? (
                <span className="text-sm text-blue-600">Assessment Required</span>
              ) : (
                <span className="text-sm text-gray-500">Quote Pending</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <Badge className={isSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}>
            {isSelected ? 'Selected' : 'Select'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ComparisonCard = ({ interest, score, onSelect, onReject, isLoading }) => {
  const professional = interest.professional;
  const account = professional?.account;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl p-6 h-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={account?.profile_picture_url} />
            <AvatarFallback className="text-lg">
              {account?.first_name?.[0]}{account?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center justify-center space-x-2">
              <h3 className="font-bold text-gray-900">
                {account?.first_name} {account?.last_name}
              </h3>
              {professional?.verification_status === 'verified' && (
                <Shield className="h-4 w-4 text-green-600" />
              )}
            </div>
            
            {professional?.business_name && (
              <p className="text-sm text-gray-600">{professional.business_name}</p>
            )}
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 text-sm">
            {score}% Match Score
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rating */}
        <div className="text-center">
          {professional?.rating_average > 0 ? (
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{professional.rating_average}</span>
              <span className="text-sm text-gray-600">
                ({professional.rating_count} reviews)
              </span>
            </div>
          ) : (
            <span className="text-gray-500">No reviews yet</span>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Pricing */}
        <div className="text-center space-y-2">
          <h4 className="font-medium text-gray-600">Pricing</h4>
          {interest.assessment ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Assessment Required</span>
              </div>
              {interest.fee > 0 && (
                <p className="text-sm">Fee: {formatCurrency(interest.fee)}</p>
              )}
            </div>
          ) : interest.amount ? (
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(interest.amount)}
            </div>
          ) : (
            <span className="text-gray-500">Quote Pending</span>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Experience */}
        <div className="text-center space-y-2">
          <h4 className="font-medium text-gray-600">Experience</h4>
          <div className="flex items-center justify-center space-x-1">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm">
              {professional?.services_offered_count || 0} services offered
            </span>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Interest Level */}
        <div className="text-center space-y-2">
          <h4 className="font-medium text-gray-600">Interest Level</h4>
          <Badge 
            className={`capitalize ${interest.intent === 'high' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}
          >
            {interest.intent}
          </Badge>
        </div>

        {/* Response Time */}
        <div className="text-center space-y-2">
          <h4 className="font-medium text-gray-600">Response Time</h4>
          <div className="flex items-center justify-center space-x-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {new Date(interest.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => onSelect(interest.interest_id)}
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Select This Professional
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Profile
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonSummary = ({ interests }) => {
  const hasQuotes = interests.filter(i => i.amount && !i.assessment);
  const needsAssessment = interests.filter(i => i.assessment);
  const averageRating = interests.reduce((sum, i) => 
    sum + (i.professional?.rating_average || 0), 0) / interests.length;
  
  const priceRange = hasQuotes.length > 0 ? {
    min: Math.min(...hasQuotes.map(i => i.amount)),
    max: Math.max(...hasQuotes.map(i => i.amount))
  } : null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center">
        <h4 className="font-medium text-gray-600 mb-2">Price Range</h4>
        {priceRange ? (
          <div className="space-y-1">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
            </div>
            <p className="text-sm text-gray-600">
              {hasQuotes.length} immediate quote{hasQuotes.length !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <span className="text-gray-500">Assessment required for quotes</span>
        )}
      </div>

      <div className="text-center">
        <h4 className="font-medium text-gray-600 mb-2">Average Rating</h4>
        <div className="flex items-center justify-center space-x-1">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-lg font-semibold text-gray-900">
            {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h4 className="font-medium text-gray-600 mb-2">Assessment Required</h4>
        <div className="text-lg font-semibold text-gray-900">
          {needsAssessment.length} of {interests.length}
        </div>
        <p className="text-sm text-gray-600">
          professional{needsAssessment.length !== 1 ? 's' : ''} need{needsAssessment.length === 1 ? 's' : ''} site visit
        </p>
      </div>
    </div>
  );
};

export default InterestComparisonView;