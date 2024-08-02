import React, { useState } from "react";

import Checkout from '../../pages/Checkout';
import NFT from '../../pages/NFT';
import VDEX from '../../pages/vDEX';

export default function Tabs() {

    const [activeTab, setActiveTab] = useState("VDEX");

    const handleTab1 = () => {
        // update the state to tab1
        setActiveTab("Tokens");
    };
    const handleTab2 = () => {
        // update the state to tab2
        setActiveTab("NFTs");
    };

    const handleTab3 = () => {
        // update the state to tab2
        setActiveTab("VDEX");
    };
    // eslint-disable jsx-a11y/no-noninteractive-element-interactions
    return (
        <VDEX />

    );
};
