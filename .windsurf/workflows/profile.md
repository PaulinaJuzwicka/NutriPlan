---
description: Profile page management and organization
---

# Profile Page Workflow

## Overview
The profile page allows users to manage their personal information, dietary preferences, health data, and goals. It's organized into tabs with comprehensive form handling.

## File Structure
- `src/pages/Profile.tsx` - Main profile page component
- `src/components/profile/ProfileTabs.tsx` - Tabbed interface with forms
- `src/components/profile/ProfileTabs.css` - Styling for profile tabs
- `src/components/auth/ChangePasswordForm.tsx` - Password change functionality

## Key Features

### 1. Profile Information Tab
- Basic user data (name, email)
- Form validation with react-hook-form
- Edit/Save/Cancel functionality
- Real-time validation feedback

### 2. Preferences Tab
- Dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Cuisine preferences (Polish, Italian, Asian, etc.)
- Meal type preferences
- Cooking time limits
- Notification settings
- Theme selection

### 3. Health Tab
- Health conditions (diabetes, hypertension, etc.)
- Health metrics:
  - Height (cm)
  - Weight (kg)
  - Blood pressure
  - Blood sugar levels

### 4. Goals Tab
- Weight management goals
- Muscle gain objectives
- Healthy eating preferences
- Target weight
- Daily calorie goals

### 5. Password Tab
- Secure password change
- Current password verification
- New password confirmation
- Polish localization

## Technical Implementation

### State Management
- Uses `AuthContextOptimized` for user data
- React Hook Form for form management
- Local state for UI interactions

### Form Handling
- Unified form submission across all tabs
- Proper validation with error messages
- Loading states during API calls
- Success/error feedback

### Styling
- Tailwind CSS for utility classes
- Custom CSS for tab-specific styling
- Responsive design for mobile devices
- Consistent color scheme

## Data Structure

### ExtendedUser Interface
```typescript
interface ExtendedUser extends User {
  dietaryRestrictions?: string[];
  healthConditions?: string[];
  healthMetrics?: {
    height?: number;
    weight?: number;
    bloodPressure?: string;
    bloodSugar?: number;
  };
  preferences?: {
    cuisine?: string[];
    mealTypes?: string[];
    cookingTime?: number;
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  goals?: {
    weightLoss?: boolean;
    muscleGain?: boolean;
    healthyEating?: boolean;
    targetWeight?: number;
    dailyCalories?: number;
  };
}
```

## Common Issues & Solutions

### Form Submission Issues
- Ensure all forms are wrapped in proper `<form>` tags
- Check `handleSubmit` is properly called
- Verify `updateProfile` function exists in auth context

### Styling Problems
- Import `ProfileTabs.css` in the component
- Check class names match CSS definitions
- Ensure responsive breakpoints are working

### Validation Errors
- Check form validation rules
- Verify error message display
- Ensure proper error state handling

## Maintenance Tasks

### Regular Updates
- Add new dietary options as needed
- Update health condition lists
- Maintain validation rules
- Check for deprecated React Hook Form patterns

### Performance Considerations
- Form data is memoized properly
- Avoid unnecessary re-renders
- Optimize checkbox rendering for large lists

### Accessibility
- Ensure proper ARIA labels
- Maintain keyboard navigation
- Check color contrast ratios
- Test with screen readers

## Testing Checklist

### Functionality
- [ ] Form submission works for all tabs
- [ ] Validation rules are enforced
- [ ] Error messages display correctly
- [ ] Loading states show properly
- [ ] Data persists after save

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Tab navigation is intuitive
- [ ] Form fields are properly styled
- [ ] Success/error states are clear

### Integration
- [ ] Auth context integration works
- [ ] API calls complete successfully
- [ ] Data updates reflect in UI
- [ ] Password change functionality works

## Future Enhancements

### Potential Improvements
- Add profile picture upload
- Implement data export functionality
- Add progress tracking for goals
- Include BMI calculation
- Add meal history integration
- Implement recipe recommendations based on preferences

### Scalability
- Consider splitting large components
- Add data validation at API level
- Implement caching for user preferences
- Add audit trail for profile changes