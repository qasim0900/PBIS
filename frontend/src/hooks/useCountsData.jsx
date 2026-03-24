import { useDispatch } from 'react-redux';
import { showNotification } from '../pages/uiSlice';
import countsAPI from '../pages/countView/countsAPI';
import { useState, useEffect, useCallback } from 'react';
import locationsAPI from '../pages/locationView/locationsAPI';
import { ensureCountSheet, fetchCountEntries, setSelectedSheet } from '../pages/countView/countsSlice';

export const useCountsData = () => {
    const dispatch = useDispatch();

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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

export default useCountsData;
