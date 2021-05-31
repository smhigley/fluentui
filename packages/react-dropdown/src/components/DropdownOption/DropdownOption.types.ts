import * as React from 'react';
import { ComponentProps, ShorthandProps, ObjectShorthandProps } from '@fluentui/react-utilities';

export interface DropdownOptionProps extends ComponentProps, React.HTMLAttributes<HTMLElement> {
  /**
   * Component children are placed in this slot
   * Avoid using the `children` property in this slot in favour of Component children whenever possible
   */
  content?: ShorthandProps<React.HTMLAttributes<HTMLElement>>;

  /**
   * Applies disabled styles to dropdown option but remains focusable
   */
  disabled?: boolean;

  /**
   * The HTML id property to use for the role="option" element
   */
  id?: string;
}

export interface DropdownOptionState extends DropdownOptionProps {
  /**
   * Ref to the root slot
   */
  ref: React.MutableRefObject<HTMLElement>;

  /**
   * State used to style the active option
   */
  activeItem: boolean;

  /**
   * Slot for the component children, avoid in favour of children and classnames for customization
   */
  content: ObjectShorthandProps<React.HTMLAttributes<HTMLElement>>;
}
