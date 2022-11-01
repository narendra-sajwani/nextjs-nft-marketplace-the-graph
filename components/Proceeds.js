import { useEffect, useState } from "react"
import { Button, useNotification } from "web3uikit"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { ethers } from "ethers"

export default function Proceeds() {
    const dispatch = useNotification()
    const [proceeds, setProceeds] = useState("0")
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]
    const { runContractFunction: getProceeds } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
            seller: account,
        },
    })

    const { runContractFunction: withdrawProceeds } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "withdrawProceeds",
        params: {},
    })

    async function updateUI() {
        // get the proceeds
        const proceeds = await getProceeds()
        setProceeds(ethers.utils.formatEther(proceeds).toString())
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleWithdrawClick = () => {
        withdrawProceeds({
            onError: (error) => console.log(error),
            onSuccess: handleWithdrawSuccess,
        })
    }

    const handleWithdrawSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "proceeds withdrawn",
            title: "Proceeds Withdrawn - please refresh (and move blocks)",
            position: "topR",
        })
    }

    return (
        <div>
            {isWeb3Enabled ? (
                <div>
                    <p>You have {proceeds} ETH withdrawable proceeds</p>
                    {proceeds > 0 && <Button text="Withdraw" onClick={handleWithdrawClick} />}
                </div>
            ) : (
                <div>Web3 is currently not enabled</div>
            )}
        </div>
    )
}
