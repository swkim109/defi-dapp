import React from 'react';
import Loader from 'react-loader-spinner';
import styled from "styled-components";

const Center = styled.div`
    width: 100px;
    height: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
`

const LoadingLayout = (props) => (
    <Center>
        <Loader type={props.type} color="#CE62D4" height={100} width={100} />
    </Center>
);

export default LoadingLayout;
