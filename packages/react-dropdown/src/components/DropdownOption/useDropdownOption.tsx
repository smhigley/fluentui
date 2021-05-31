import * as React from 'react';
import {
  makeMergePropsCompat,
  resolveShorthandProps,
  shouldPreventDefaultOnKeyDown,
  useEventCallback,
  useId,
  useMergedRefs,
} from '@fluentui/react-utilities';
import { DropdownOptionProps, DropdownOptionState } from './DropdownOption.types';
import { useDropdownListContext, useDropdownDescendant } from '../../contexts/dropdownListContext';
// import { useCharacterSearch } from './useCharacterSearch';

/**
 * Const listing which props are shorthand props.
 */
export const dropdownOptionShorthandProps = ['content'] as const;

// eslint-disable-next-line deprecation/deprecation
const mergeProps = makeMergePropsCompat<DropdownOptionState>({ deepMerge: dropdownOptionShorthandProps });

/**
 * Returns the props and state required to render the component
 */
export const useDropdownOption = (
  props: DropdownOptionProps,
  ref: React.Ref<HTMLElement>,
  defaultProps?: DropdownOptionProps,
): DropdownOptionState => {
  const id = useId('dropdown-option-', props.id);
  const activeId = useDropdownListContext(context => context['aria-activedescendant']);
  const setActiveIndex = useDropdownListContext(context => context.setActiveIndex);

  const state = mergeProps(
    {
      ref: useMergedRefs(ref, React.useRef(null)),
      content: { as: 'div', children: props.children },
      role: 'option',
      id,
      activeItem: id === activeId,
      'aria-disabled': props.disabled,
    },
    defaultProps && resolveShorthandProps(defaultProps, dropdownOptionShorthandProps),
    resolveShorthandProps(props, dropdownOptionShorthandProps),
  );

  // register a descendant of the dropdown
  const optionIndex = useDropdownDescendant({ element: state.ref.current, id });

  const { onClick: onClickOriginal, onKeyDown: onKeyDownOriginal } = state;
  state.onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (shouldPreventDefaultOnKeyDown(e)) {
      e.preventDefault();

      if (state.disabled) {
        return;
      }

      (e.target as HTMLElement)?.click();
    }

    onKeyDownOriginal?.(e);
  };

  state.onClick = (e: React.MouseEvent<HTMLElement>) => {
    if (state.disabled) {
      return;
    }

    setActiveIndex(optionIndex);

    onClickOriginal?.(e);
  };

  const { onMouseEnter: onMouseEnterOriginal } = state;
  state.onMouseEnter = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    state.ref.current?.focus();

    onMouseEnterOriginal?.(e);
  });

  // useCharacterSearch(state);
  return state;
};
