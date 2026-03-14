'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { getAllRoles, getRoleLabel } from '@/lib/organization/role-definitions';

interface ResponsibleRolesInputProps {
  value: string[];
  onChange: (roles: string[]) => void;
  disabled?: boolean;
}

/**
 * ResponsibleRolesInput — Tags + Autocomplete component
 * Story 10.2: Redesign Responsible Roles UI
 *
 * Features:
 * - Tag-based role display with remove button
 * - Autocomplete dropdown with filtering
 * - Full keyboard navigation (ArrowUp/Down, Enter, Escape, Backspace)
 * - WCAG AA accessibility (ARIA labels, focus management)
 * - Responsive design (mobile-friendly)
 */
export function ResponsibleRolesInput({
  value,
  onChange,
  disabled = false,
}: ResponsibleRolesInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allRoles = getAllRoles();
  const selectedRoles = new Set(value);
  const filteredRoles = allRoles.filter(
    role => !selectedRoles.has(role.value) &&
             role.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (roleValue: string) => {
    if (!value.includes(roleValue)) {
      onChange([...value, roleValue]);
      setInputValue('');
      setHighlightedIndex(0);
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const handleRemove = (roleValue: string) => {
    onChange(value.filter(r => r !== roleValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key !== 'Backspace' && e.key !== 'ArrowDown') {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(prev =>
          prev < filteredRoles.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;

      case 'Enter':
        e.preventDefault();
        if (filteredRoles[highlightedIndex]) {
          handleSelect(filteredRoles[highlightedIndex].value);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;

      case 'Backspace':
        if (inputValue === '' && value.length > 0) {
          e.preventDefault();
          handleRemove(value[value.length - 1]);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Tag Display */}
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-10">
        {value.map(roleValue => (
          <Badge
            key={roleValue}
            variant="secondary"
            className="gap-1 flex items-center"
            role="option"
            aria-selected="true"
          >
            {getRoleLabel(roleValue) || roleValue}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemove(roleValue)}
              aria-label={`Remove ${getRoleLabel(roleValue)}`}
              disabled={disabled}
              type="button"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Input + Dropdown */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search and add roles..."
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setHighlightedIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          aria-label="Add responsible role"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
          autoComplete="off"
        />

        {/* Autocomplete Dropdown */}
        {open && filteredRoles.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md bg-popover shadow-md max-h-60 overflow-y-auto"
            role="listbox"
          >
            <Command>
              <CommandList>
                <CommandEmpty>No roles found.</CommandEmpty>
                <CommandGroup>
                  {filteredRoles.map((role, index) => (
                    <CommandItem
                      key={role.value}
                      value={role.value}
                      onSelect={() => handleSelect(role.value)}
                      className={`cursor-pointer ${
                        index === highlightedIndex ? 'bg-accent' : ''
                      }`}
                      role="option"
                      aria-selected={index === highlightedIndex}
                    >
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="font-medium">{role.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} role{value.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
