import React, { useState, useRef, useCallback } from 'react';
import {
    Button,
    ButtonGroup,
    Popper,
    Grow,
    Paper,
    MenuList,
    MenuItem,
    ClickAwayListener,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


//---------------------------------------
// :: Split Button component
//---------------------------------------

/*
A reusable SplitButton component that shows a main button with an optional label and a dropdown of 
selectable options, triggering a callback on selection.
*/


/**
 * SplitButton component
 * 
 * @param {Array<string>} options - Options for dropdown
 * @param {number} initialIndex - Default selected index
 * @param {string} buttonLabel - Optional button label override
 * @param {(index: number, option: string) => void} onSelect - Callback on selection
 */


//---------------------------------------
// :: Split Button Function
//---------------------------------------

/*
A SplitButton component that displays a main button with a dropdown of options, allowing selection via click, 
updating the selected index, and triggering a callback on choice.
*/

const SplitButton = ({ options = [], initialIndex = 0, buttonLabel, onSelect, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(initialIndex);
    const anchorRef = useRef(null);

    //---------------------------------------
    // :: handle Click Function
    //---------------------------------------

    /*
    A callback that triggers the `onSelect` function with the currently selected option when the main button is clicked.
    */

    const handleClick = useCallback(() => {
        if (disabled) return;
        if (onSelect) onSelect(selectedIndex, options[selectedIndex]);
    }, [onSelect, selectedIndex, options, disabled]);


    //---------------------------------------
    // :: handle Menu Item Click Function
    //---------------------------------------

    /*
    A callback that updates the selected index, closes the dropdown, and calls `onSelect` 
    with the chosen option when a menu item is clicked.
    */

    const handleMenuItemClick = useCallback((event, index) => {
        setSelectedIndex(index);
        setOpen(false);
        if (onSelect) onSelect(index, options[index]);
    }, [onSelect, options]);

    //---------------------------------------
    // :: handle Toggle Function
    //---------------------------------------

    /*
    A callback that toggles the dropdown menu open or closed.
    */

    const handleToggle = useCallback(() => {
        if (!disabled) setOpen((prev) => !prev);
    }, [disabled]);


    //---------------------------------------
    // :: handle Close Function
    //---------------------------------------

    /*
    A callback that closes the dropdown menu when clicking outside of the button group, ignoring clicks on the button itself.
    */

    const handleClose = useCallback((event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) return;
        setOpen(false);
    }, []);



    //---------------------------------------
    // :: Return Code
    //---------------------------------------

    /*
    Renders a split button with a main action and a dropdown menu, showing the selected option, handling clicks, 
    toggling the menu, and closing it when clicking away.
    */

    return (
        <>
            <ButtonGroup 
                variant="contained" 
                ref={anchorRef} 
                aria-label="split button"
                disabled={disabled}
            >
                <Button 
                    onClick={handleClick}
                    disabled={disabled}
                >
                    {buttonLabel || options[selectedIndex]}
                </Button>
                <Button
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="menu"
                    onClick={handleToggle}
                    disabled={disabled}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                placement="bottom-start"
                sx={{ 
                    zIndex: 1300,
                }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper 
                            elevation={8}
                            sx={{
                                mt: 0.5,
                                minWidth: anchorRef.current?.offsetWidth || 120,
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                boxShadow: (theme) => theme.shadows[8],
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList 
                                    id="split-button-menu" 
                                    autoFocusItem
                                    sx={{
                                        py: 0.5,
                                    }}
                                >
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                minHeight: 40,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                                '&.Mui-selected': {
                                                    bgcolor: 'action.selected',
                                                    '&:hover': {
                                                        bgcolor: 'action.selected',
                                                    },
                                                },
                                            }}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};


//---------------------------------------
// :: Export Memo Split Button
//---------------------------------------

/*
Exports the `SplitButton` component wrapped in `React.memo` to optimise rendering by preventing unnecessary re-renders.
*/

export default React.memo(SplitButton);
