import * as React from 'react';
import { makeMergePropsCompat, resolveShorthandProps, useMergedRefs } from '@fluentui/react-utilities';
import { AccordionProps, AccordionState } from './Accordion.types';
import { useCreateAccordionContextValue } from './useAccordionContext';

/**
 * Const listing which props are shorthand props.
 */
export const accordionShorthandProps = ['expandIcon', 'button', 'icon'] as const;

// eslint-disable-next-line deprecation/deprecation
const mergeProps = makeMergePropsCompat<AccordionState>({ deepMerge: accordionShorthandProps });

/**
 * Returns the props and state required to render the component
 * @param props - Accordion properties
 * @param ref - reference to root HTMLElement of Accordion
 * @param defaultProps - default values for the properties of Accordion
 */
export const useAccordion = (
  props: AccordionProps,
  ref: React.Ref<HTMLElement>,
  defaultProps?: AccordionProps,
): AccordionState => {
  const state = mergeProps(
    {
      ref: useMergedRefs(ref, React.useRef(null)),
      collapsible: false,
      multiple: false,
      navigable: false,
    },
    defaultProps,
    resolveShorthandProps(props, accordionShorthandProps),
  );
  const [context, descendants, setDescendants] = useCreateAccordionContextValue(state);
  state.context = context;
  state.descendants = descendants;
  state.setDescendants = setDescendants;
  return state;
};
