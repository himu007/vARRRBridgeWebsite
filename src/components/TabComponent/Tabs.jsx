import React, { useState } from "react";

import ARRR from '../../pages/ARRR';
import Checkout from '../../pages/Checkout';
import NFT from '../../pages/NFT';

export default function Tabs() {

    const [activeTab, setActiveTab] = useState("ARRR");

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
        setActiveTab("ARRR");
    };
    // eslint-disable jsx-a11y/no-noninteractive-element-interactions
    return (
        <div className="maintab">
            <div className="Tabs">
                {/* Tab nav */}

            </div>
            {/* eslint-disable-next-line no-nested-ternary */}
            {activeTab === "Tokens" ? <Checkout /> : activeTab === "NFTs" ? <NFT /> : <ARRR />}
        </div>

    );
};
