"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import useGenres from "@/hooks/useGenres";

export default function SelectGenres({
    value = [],
    label = "Genres",
    id = "genres",
    name = "genres",
    onChange,
    onBlur,
    required = false,
    placeholder = "Select genres...",
    isMulti = true,
    className = "",
    disabled = false,
}) {
    const {
        genres,
        fetchGenres,
        loading,
        handleChangeFilter,
        getGenreById,
    } = useGenres();

    const [selectedGenres, setSelectedGenres] = useState([]);

    // Load initial genres list
    useEffect(() => {
        fetchGenres();
    }, []);

    // When value changes, sync selected items
    useEffect(() => {
        if (!value || value.length === 0) {
            setSelectedGenres([]);
            return;
        }

        const loadSelected = async () => {
            const selected = [];

            for (const id of value) {
                let found = genres.find((g) => g.id === id);

                if (!found) {
                    found = await getGenreById(id);
                }

                if (found) {
                    selected.push({
                        value: found.id,
                        label: found.name,
                    });
                }
            }

            setSelectedGenres(selected);
        };

        loadSelected();
    }, [value, genres]);

    // Map API items → Select options
    const mapToOptions = useCallback(
        (items) =>
            (items || []).map((g) => ({
                value: g.id,
                label: g.name,
            })),
        []
    );

    // Async load options (search)
    const loadOptionsFn = useCallback(
        async (inputValue, callback) => {
            handleChangeFilter("search", inputValue, false);

            setTimeout(() => {
                callback(mapToOptions(genres));
            }, 200);
        },
        [genres, handleChangeFilter, mapToOptions]
    );

    // Debounced search
    const debouncedLoadOptions = useMemo(
        () => debounce(loadOptionsFn, 300),
        [loadOptionsFn]
    );

    useEffect(() => {
        return () => debouncedLoadOptions.cancel();
    }, [debouncedLoadOptions]);

    // Change handler
    const handleSelectChange = (options) => {
        const newValue = isMulti
            ? options?.map((o) => o.value) || []
            : options?.value || "";

        setSelectedGenres(options);
        handleChangeFilter("search", "", false);

        onChange?.({
            target: { name, value: newValue },
        });
    };

    const handleBlurInput = () => {
        onBlur?.({
            target: { name, value: selectedGenres?.map((s) => s.value) },
        });
    };

    // 🎨 Custom styles (mismo estilo que tu Select usado antes)
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "black",
            borderColor: state.isFocused ? "#f59e0b" : "#374151",
            borderRadius: "0.5rem",
            boxShadow: state.isFocused ? "0 0 0 1px #f59e0b" : "none",
            color: "white",
            minHeight: "2.5rem",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "black",
            borderColor: "#374151",
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#f59e0b"
                : state.isFocused
                    ? "#374151"
                    : "black",
            color: state.isSelected ? "#111827" : "white",
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#374151",
            color: "white",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "white",
        }),
    };

    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-300">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <AsyncSelect
                inputId={id}
                instanceId={id}
                isMulti={isMulti}
                defaultOptions={mapToOptions(genres)}
                cacheOptions
                loadOptions={debouncedLoadOptions}
                value={selectedGenres}
                onChange={handleSelectChange}
                onBlur={handleBlurInput}
                isDisabled={disabled}
                isClearable
                placeholder={placeholder}
                isLoading={loading}
                styles={customStyles}
                menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                }
            />
        </div>
    );
}
