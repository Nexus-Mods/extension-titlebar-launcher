import * as React from 'react';
import { Image } from 'react-bootstrap';
import { Icon } from 'vortex-api';

export interface IToolIconProps {
  imageUrl: string;
  altUrl: string;
}

const ToolIcon = (props: IToolIconProps) => {
  const [url, setUrl] = React.useState(props.imageUrl);

  if (url !== undefined) {
    const src = props.imageUrl;
    return (
      <Image
        src={src}
        className={'tool-icon'}
        onError={() => { if (url === props.imageUrl) { setUrl(props.altUrl); } else { setUrl(undefined) } }}
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
