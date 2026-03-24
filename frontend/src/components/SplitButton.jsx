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

const SplitButton = ({ options = [], initialIndex = 0, buttonLabel, onSelect, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(initialIndex);
    const anchorRef = useRef(null);

    const handleClick = useCallback(() => {
        if (disabled) return;
        if (onSelect) onSelect(selectedIndex, options[selectedIndex]);
    }, [onSelect, selectedIndex, options, disabled]);

    const handleMenuItemClick = useCallback((event, index) => {
        setSelectedIndex(index);
        setOpen(false);
        if (onSelect) onSelect(index, options[index]);
    }, [onSelect, options]);

    const handleToggle = useCallback(() => {
        if (!disabled) setOpen((prev) => !prev);
    }, [disabled]);

    const handleClose = useCallback((event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) return;
        setOpen(false);
    }, []);

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

export default React.memo(SplitButton);
