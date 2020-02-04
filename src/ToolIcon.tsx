import * as React from 'react';
import { Image } from 'react-bootstrap';
import { Icon } from 'vortex-api';

export interface IToolIconProps {
  imageUrl: string;
}

const ToolIcon = (props: IToolIconProps) => {
  if (props.imageUrl !== undefined) {
    const src = props.imageUrl;
    return (
      <Image
        src={src}
        className={'tool-icon'}
      />
    );
  } else {
    return (
      <Icon
        name='executable'
        className={'tool-icon'}
      />
    );
  }
};

export default ToolIcon;
