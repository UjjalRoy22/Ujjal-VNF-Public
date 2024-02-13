"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container } from "react-bootstrap";
import { pricingData } from "@/utils/pricing";
import Web3 from "web3";
import Link from "next/link";
import { abi as contractABI } from "build/contracts/VNF.json"; // Import ABI


const contractAddress = '0xEB62e8E3DbFFc922F961d4E04BDb78D8fb9DA3C4';
const localUrl = 'http://localhost:8545'

interface BlockData {
  id: string;
  vnfName: string;
  vnfHash: string;
  testResult: string;
  reviewResult: string;
  verifierResult: string;
  description: string;
}

export default function Customer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid");
  const [user, setUser] = useState<UserData | null>(null);
  const [isUser, setIsUser] = useState(false);
  const [blockData, setBlockData] = useState<BlockData[]>([]);

  const fetchBlockData = async () => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const latestBlockNumber = await web3.eth.getBlockNumber();
      const blocks = [];
      const startBlock = BigInt(latestBlockNumber) - BigInt(5);
  
      for (let i = BigInt(latestBlockNumber); i > startBlock; i--) {
        if (i < 0) {
          console.error('Invalid block number:', i);
          continue;
        }
  
        const block = await web3.eth.getBlock(i, true);
  
        if (block && block.transactions) {
          for (const transaction of block.transactions) {
            try {
              const decodedData = web3.eth.abi.decodeParameters(
                ["string", "string", "string", "string", "string", "string", "string"],
                transaction.input as string
              );
  
              blocks.push({
                id: decodedData[0] as string,
                vnfName: decodedData[1] as string,
                vnfHash: decodedData[2] as string,
                testResult: decodedData[3] as string,
                reviewResult: decodedData[4] as string,
                verifierResult: decodedData[5] as string,
                description: decodedData[6] as string,
              });
            } catch (decodeError) {
              console.error('Error decoding transaction input:', decodeError);
            }
          }
        }
      }
  
      setBlockData(blocks);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  useEffect(() => {
    if (!userid) {
      console.log("User is not present");
      router.push("/login");
    } else {
      const foundUser = userData.find((user) => user.id === String(userid));
      if (foundUser) {
        console.log("User found:", foundUser);
        setUser(foundUser);
        setIsUser(true);
      } else {
        console.log("User not found");
        router.push("/login");
      }
    }
  }, [userid]);

  useEffect(() => {
    fetchBlockData();
  }, []);

  const handleTabClick = (tabNumber: number) => {
    // handle tab click
  };

// Check if ethereum object exists on window
if ((window as any).ethereum) {
  // Access ethereum object
  const ethereum = (window as any).ethereum;

  // Now you can use ethereum object
  ethereum.enable().then(() => {
    // Do something after ethereum is enabled
  });
} else {
  console.error("MetaMask is not installed");
}

  
  const buyVNF = async (badgerId: number) => {
  try {
    // Type assertion to explicitly tell TypeScript that window has an ethereum property
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      console.error('MetaMask is not installed or not detected');
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(ethereum);
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    await contract.methods.buyVNF(badgerId).send({
      from: user?.ethadd,
      value: web3.utils.toWei('1', 'ether'), // Adjust the value based on the VNF price
    });
    console.log(badgerId);

    // Optional: Refresh the block data after purchase
    fetchBlockData();
  } catch (error) {
    console.error('Error buying VNF:', error);
  }
};

return (
  <>
    <Layout>
      <Container className="bg-gray-200 p-5 rounded-md h-screen">
        <section className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold text-gray-900 self-center text-center">::VNF Repository::</h2>
              <br />
              <br />
              <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">Customer Dashboard</h2>
              <br />
              <br />
              <div className="justify-center">
                <div className="">
                  <h1 className="text-1xl font-extrabold text-gray-700 text-center">::Current User Details::</h1>
                </div>
                <div className="block text-center px-5 py-2.5 mr-2 mb-2 text-sm h-12 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-900 focus:outline-none dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-400 ">
                  {user?.name} :: {user?.roleName}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {blockData.map((badge, badgeIndex) => (
                <div key={badgeIndex} className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                  <h5 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-400 text-center">{badge.vnfName}</h5>
                  <ul role="list" className="space-y-5 my-7">
                    <li className="flex space-x-3 items-center " key={badge.testResult}>
                      <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">VNF Hash: {badge.vnfHash}</span>
                    </li>
                    <li className="flex space-x-3 items-center " key={badge.testResult}>
                      <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Test Result: {badge.testResult}</span>
                    </li>
                    <li className="flex space-x-3 items-center " key={badge.reviewResult}>
                      <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Review Result: {badge.reviewResult}</span>
                    </li>
                    <li className="flex space-x-3 items-center " key={badge.reviewResult}>
                      <span className="text-base font-semibold leading-tight text-gray-700 dark:text-gray-400">Verifier Result: {badge.verifierResult}</span>
                    </li>
                  </ul>
                  
                  <button 
                    type="button" 
                    onClick={() => buyVNF(parseInt(badge.id))} // Pass the badge id to the buyVNF function
                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center"
                  >
                    Buy VNF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </Layout>
  </>
);
}