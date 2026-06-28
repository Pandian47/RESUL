# Firebase Web Push Configuration - Stepper Implementation

## Overview
This document describes the implementation of a multi-step stepper interface for Firebase Web Push configuration, providing an alternative to the standard single-page form.

## Files Modified/Created

### 1. **RRPushWebGrid.jsx** (NEW)
**Path:** `src/Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/Create/RRPushWebGrid.jsx`

This is the new stepper-based form component that provides a guided, step-by-step configuration experience.

#### Features:
- **3-Step Wizard Interface:**
  - Step 1: Domain Onboarding (mandatory)
  - Step 2: Firebase Cloud Messaging (optional)
  - Step 3: Firebase Project Details (optional)

- **Visual Components:**
  - Vertical sidebar stepper with progress indicators
  - Step numbers with checkmarks for completed steps
  - Active step highlighting
  - Required/Optional step indicators

- **Navigation:**
  - Back button to return to previous step
  - Next button with validation
  - Skip button for optional steps
  - Cancel button to exit wizard
  - Submit button on final step

- **Validation:**
  - Step-specific field validation
  - Prevents progression until current step is valid
  - All existing validation rules maintained

### 2. **index.jsx** (Parent Component - MODIFIED)
**Path:** `src/Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/index.jsx`

#### Changes:
- Added import for `RRPushWebGrid` component
- Added `useStepperView` state to toggle between views
- Exposed stepper toggle state via context
- Conditional rendering: uses `RRPushWebGrid` when stepper view is enabled, otherwise uses `PushWebCreate`

```javascript
{gridCreate.pushWebAction.show && (
    useStepperView ? (
        <RRPushWebGrid {...props} />
    ) : (
        <PushWebCreate {...props} />
    )
)}
```

### 3. **Grid/index.jsx** (Grid Component - MODIFIED)
**Path:** `src/Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/Grid/index.jsx`

#### Changes:
- Added React Bootstrap `Form` import
- Added toggle switch in the grid header
- Toggle switch labeled "Stepper View" 
- Toggle state managed through context

```javascript
<Form.Check
    type="switch"
    id="stepper-view-toggle"
    label="Stepper View"
    checked={context?.useStepperView || false}
    onChange={(e) => {
        context?.setUseStepperView(e.target.checked);
    }}
/>
```

## How It Works

### User Flow:

1. **Grid View:**
   - User sees the list of existing web push configurations
   - Toggle switch "Stepper View" is available in the header
   - User can enable/disable stepper view at any time

2. **Creating New Configuration:**
   - User clicks the "+" (Add) button
   - If stepper view is **enabled**: Shows `RRPushWebGrid` (step-by-step wizard)
   - If stepper view is **disabled**: Shows `PushWebCreate` (standard form)

3. **Editing Existing Configuration:**
   - User clicks edit icon on any configuration
   - Respects the current toggle state (stepper or standard)
   - All data is pre-populated in both views

### Stepper Navigation:

```
[Domain Onboarding] → [Firebase Cloud Messaging] → [Firebase Project Details] → Submit
     (Required)              (Optional)                   (Optional)
```

- **Step 1 (Required):** Must be completed before proceeding
- **Step 2-3 (Optional):** Can be skipped if needed
- Users can click on any previous step to go back
- Form data is preserved when navigating between steps

### Technical Details:

#### State Management:
- Uses React Hook Form for form state
- Step progression managed with `currentStep` state
- Toggle state shared via React Context

#### Validation:
- Each step validates only its relevant fields
- Uses `methods.trigger(fieldsArray)` for step-specific validation
- All validation rules from original component maintained

#### Styling:
- Uses React Bootstrap components (`Card`, `ListGroup`, `Row`, `Col`)
- Bootstrap utility classes for styling
- Project icon constants for UI elements
- Responsive layout with sidebar stepper

## Benefits

### For Users:
1. **Guided Experience:** Step-by-step reduces cognitive load
2. **Clear Progress:** Visual indicators show completion status
3. **Flexibility:** Option to skip non-critical steps
4. **Error Prevention:** Validates each step before progression
5. **Choice:** Toggle between stepper and standard form based on preference

### For Development:
1. **Code Reusability:** Same form fields and validation logic
2. **Maintainability:** Separated concerns, easy to update
3. **Backwards Compatible:** Original form still available
4. **No Breaking Changes:** Existing functionality preserved

## Usage

### Enabling Stepper View:
1. Navigate to **Preferences → Communication Settings → Channel Settings → Notification → Web**
2. Toggle "Stepper View" switch in the grid header
3. Click "+" to add new configuration (stepper wizard will appear)

### Disabling Stepper View:
1. Toggle "Stepper View" switch off
2. Click "+" to add new configuration (standard form will appear)

## Future Enhancements

Potential improvements:
- [ ] Save step progress and resume later
- [ ] Add step summary/review before final submission
- [ ] Keyboard shortcuts for navigation
- [ ] Customizable step order
- [ ] Collapsible step sidebar for more content space
- [ ] Step-specific help tooltips
- [ ] Progress percentage indicator

## Component Props

Both `RRPushWebGrid` and `PushWebCreate` accept the same props:

| Prop | Type | Description |
|------|------|-------------|
| `type` | string | Either 'create' or 'edit' |
| `handleCancel` | function | Callback when user cancels |
| `config` | object | Configuration data (for edit mode) |
| `setFailedApi` | function | Error handling callback |

## Context Structure

```javascript
{
    gridCreate: {
        showGrid: boolean,
        pushWebAction: {
            show: boolean,
            edit: {
                isEdit: boolean,
                editState: object
            }
        }
    },
    useStepperView: boolean,
    setUseStepperView: function,
    setGridCreate: function
}
```

## Support

For issues or questions about the stepper implementation, refer to:
- Original form component: `PushWebCreate` (`index.jsx`)
- Firebase JSON modal: `FirebaseJSONUploadModal.jsx`
- Constants: `constant.jsx`

