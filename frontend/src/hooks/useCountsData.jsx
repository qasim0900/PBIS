import { useDispatch } from 'react-redux';
import { showNotification } from '../pages/uiSlice';
import countsAPI from '../pages/countView/countsAPI';
import { useState, useEffect, useCallback } from 'react';
import locationsAPI from '../pages/locationView/locationsAPI';
import { ensureCountSheet, fetchCountEntries, setSelectedSheet } from '../pages/countView/countsSlice';


//---------------------------------------
// :: use Counts Data Operations
//---------------------------------------

/*
Custom hook to manage locations, selected frequency, count data loading, and submission with notifications.
*/

export const useCountsData = () => {
    const dispatch = useDispatch();

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);


    //---------------------------------------
    // :: Load locations on mount Function
    //---------------------------------------

    /*
    This `useEffect` automatically fetches all locations on mount and updates state, showing an error 
    notification if the request fails.
    */

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const res = await locationsAPI.getAll();
                const locs = res.data?.results ?? res.data ?? [];
                setLocations(Array.isArray(locs) ? locs : []);
            } catch (error) {
                dispatch(
                    showNotification({ message: 'Failed to load locations', type: 'error' })
                );
            }
        };
        loadLocations();
    }, [dispatch]);


    //---------------------------------------
    // :: load Count Data Function
    //---------------------------------------

    /*
    This `loadCountData` function fetches the count sheet and its entries for the selected location and frequency, updates the Redux state, 
    and handles loading and error notifications.
    */

    const loadCountData = useCallback(async () => {
        if (!selectedLocation || !selectedFrequency) return;

        setLoading(true);
        try {
            const action = await dispatch(
                ensureCountSheet({
                    locationId: selectedLocation,
                    frequency: selectedFrequency,
                })
            );
            const sheet = action.payload;

            dispatch(setSelectedSheet(sheet));
            dispatch(fetchCountEntries(sheet.id));
        } catch (error) {
            dispatch(
                showNotification({ message: 'Failed to load data', type: 'error' })
            );
        } finally {
            setLoading(false);
        }
    }, [dispatch, selectedLocation, selectedFrequency]);


    //---------------------------------------
    // :: Submit Sheet Function
    //---------------------------------------

    /*
    This `submitSheet` function submits a count sheet by ID, shows success or error notifications, and manages the submitting state.
    */

    const submitSheet = useCallback(
        async (sheetId) => {
            if (!sheetId) return;

            setSubmitting(true);
            try {
                await countsAPI.submitSheet(sheetId);
                dispatch(
                    showNotification({ message: 'Sheet submitted successfully', type: 'success' })
                );
            } catch (error) {
                dispatch(
                    showNotification({ message: 'Failed to submit sheet', type: 'error' })
                );
            } finally {
                setSubmitting(false);
            }
        },
        [dispatch]
    );


    //---------------------------------------
    // :: Return Code
    //---------------------------------------

    /*
    This hook returns the current locations, selected location/frequency, loading/submitting states, 
    and functions to load or submit count data.
    */

    return {
        locations,
        selectedLocation,
        setSelectedLocation,
        selectedFrequency,
        setSelectedFrequency,
        loading,
        submitting,
        loadCountData,
        submitSheet,
    };
};


//---------------------------------------
// :: Export use Count Data
//---------------------------------------

/*
Exports the `useCountsData` hook for managing locations, count sheets, and submission logic.
*/

export default useCountsData;
