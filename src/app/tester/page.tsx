"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container } from "react-bootstrap";
import Web3 from "web3";
import Link from "next/link";
const contractAddress = '0xF570BaF61D48d7F767135Df9b25013B29bb0bbf1';
const localUrl = 'http://localhost:8545'
interface BlockData 
  { roleId: any; devId: any; devName: any; ipfsHash: any; devAddress: any; }


export default function Tester() {
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tabNumber: React.SetStateAction<number>) => {
    setActiveTab(tabNumber);
  };
  const [blockData, setBlockData] = useState<BlockData[]>([]); 
  const router = useRouter();
  // const [user, setUser] = React.useState<UserData | null>(null);
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid");
  const [isUser, setIsUser] = React.useState(false);
  const [user, Setuser] = React.useState<UserData | null>(null);


  const fetchDeveloperDataByRoleId = async (roleId: string) => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const latestBlockNumber = await web3.eth.getBlockNumber();

      const blocks = [];
      const startBlock = BigInt(latestBlockNumber) - BigInt(5);

      for (let i = BigInt(latestBlockNumber); i > startBlock; i--) {
        const block = await web3.eth.getBlock(i, true);

        if (block && block.transactions) {
          for (const transaction of block.transactions) {
            try {
              const decodedData = web3.eth.abi.decodeParameters(
                ["string", "string", "string", "string", "address"],
                transaction.input as string
              );

              // Check if the roleId matches the desired roleId
              if (decodedData[0] === roleId) {
                blocks.push({
                  roleId: decodedData[0] as string,
                  devId: decodedData[1] as string,
                  devName: decodedData[2] as string,
                  ipfsHash: decodedData[3] as string,
                  devAddress: decodedData[4] as string,
                });
              }
            } catch (decodeError) {
              console.error('Error decoding transaction input:', decodeError);
            }
          }
        }
      }

      setBlockData(blocks);
    } catch (error) {
      console.error('Error fetching developer data by roleId:', error);
    }
  };

  // Example: Fetch developer data for roleId "123"
  useEffect(() => {
    const roleIdToFetch = "1"; // Replace with the desired roleId
    fetchDeveloperDataByRoleId(roleIdToFetch);
  }, []);

  // Access the user from the query parameters
  // const  fetchBlockData = async () => {
  //   try {
  //     const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  //     const latestBlockNumber = await web3.eth.getBlockNumber();
  
  //     const blocks = [];
  //     const startBlock = BigInt(latestBlockNumber) - BigInt(5);
  
  //     for (let i = BigInt(latestBlockNumber); i > startBlock; i--) {
  //       const block = await web3.eth.getBlock(i, true); //Set the second parameter to true to include transactions
  //       console.log("test");
  
  //       if (block && block.transactions) {
  //         for (const transaction of block.transactions) {
  //           console.log(transaction);
  //           try {
  //             const decodedData = web3.eth.abi.decodeParameters(
                
  //                 ["string","string", "string","string", "address"],
  //               transaction.input as string
  //             );
  
  //             console.log(decodedData);
              
  
  //             blocks.push({
  //               roleId: decodedData[0] as string,
  //               devId: decodedData[1] as string, // Ensure id is converted to a string if it's a number
  //               devName: decodedData[2] as string,
  //               ipfsHash: decodedData[3] as string,
  //               devAddress: decodedData[4] as string,
  //             });
  //           } catch (decodeError) {
  //             console.error('Error decoding transaction input:', decodeError);
  //           }
  //         }
  //       }
  //     }
  
  //     setBlockData(blocks);
  //   } catch (error) {
  //     console.error('Error fetching block data:', error);
  //   }
  // };

  const [blockUpload, setBlockUplaod] = useState({
    roleId: "",
    testId : "",
    testName : "",
    ipfsHash : "",
    testResult: "",
    testAddress: ""
  })
  const AcceptTestUploadBlockchain = async (hash: string) => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const randomId = Math.floor(Math.random() * 100).toString();
      const id = Math.floor(Math.random() * 100).toString();
        console.log("id : ",id);

      // Update state with the relevant information
        setBlockUplaod({
          roleId: user?.role as string,
          testId: id.toString(),
          testName: user?.name as string,
          ipfsHash: hash as string,
          testAddress: user?.ethadd as string,
          testResult: "true", //Assuming the test result is set to "true"
        
        });

     // Encode parameters for the transaction data
      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string','string', 'string', 'string', 'string', 'string'],
        [
       
       
          // random id
          // random id
          user?.role as string,
          randomId,
       user?.name as string,
       hash,
       user?.ethadd as string,
        "true",
        ]
      );
       const  myEthAdd = user?.ethadd as string;
      console.log(dataToUpload);
  
      // Create the transaction object
      const gas = 32632; // Set an appropriate gas limit
      const gasPrice = 100; // Set an appropriate gas price (in wei)
      const nonce = await web3.eth.getTransactionCount(myEthAdd, 'latest');
      const transactionObject = {
        from: myEthAdd,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data: dataToUpload,
      };
  
      // Send the transaction to the Ethereum network
      const receipt = await web3.eth.sendTransaction(transactionObject);
      console.log('Transaction receipt:', receipt);
  
      console.log('Data uploaded to the Ethereum blockchain.');
      window.alert('Tester Accepted');

    } catch (error) {
      console.error('Error uploading data to the Ethereum blockchain:', error);
    }
  };

  const RejectTestUploadBlockchain = async (hash: string) => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const randomId = Math.floor(Math.random() * 100).toString();
      const id = Math.floor(Math.random() * 100).toString();
        console.log("id : ",id);

      // Update state with the relevant information
        setBlockUplaod({
          roleId: user?.role as string,
          testId: id.toString(),
          testName: user?.name as string,
          ipfsHash: hash as string,
          testAddress: user?.ethadd as string,
          testResult: "false", //Assuming the test result is set to "true"
        
        });

     // Encode parameters for the transaction data
      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string','string', 'string', 'string', 'string', 'string'],
        [
       
       
          // random id
          // random id
          user?.role as string,
          randomId,
       user?.name as string,
       hash,
       user?.ethadd as string,
        "false",
        ]
      );
       const  myEthAdd = user?.ethadd as string;
      console.log(dataToUpload);
  
      // Create the transaction object
      const gas = 32632; // Set an appropriate gas limit
      const gasPrice = 100; // Set an appropriate gas price (in wei)
      const nonce = await web3.eth.getTransactionCount(myEthAdd, 'latest');
      const transactionObject = {
        from: myEthAdd,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data: dataToUpload,
      };
  
      // Send the transaction to the Ethereum network
      const receipt = await web3.eth.sendTransaction(transactionObject);
      console.log('Transaction receipt:', receipt);
  
      console.log('Data uploaded to the Ethereum blockchain.');
      window.alert('Tester Rejected');

    } catch (error) {
      console.error('Error uploading data to the Ethereum blockchain:', error);
    }
  };
  useEffect(() => {
    if (!userid) {
      console.log("User is not present");
      router.push("/login"); // Redirect to the login page if user is not present
    } else {
      const foundUser = userData.find((user) => user.id === String(userid));
      if (foundUser) {
        console.log("User found:", foundUser);
        Setuser(foundUser); // Set the user data when the user is found
        setIsUser(true);
      } else {
        console.log("User not found");
        router.push("/login"); // Redirect to the login page if user is not found
      }
    }
    // fetchBlockData();
    
   
  }, [userid]);

  console.log(userid);
  return (
    <>
      <Layout>
        <Container className="bg-gray-200 p-5 rounded-md h-screen">
          <section className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 self-center text-center">
                  ::VNFTestChain::
                </h2>

                <br />
                <br />
                <h2 className="text-2xl font-extrabold text-gray-900 self-center text-center">
                  Tester Dashboard
                </h2>
                <br />
                <br />
                <div  className="justify-center">
                  <div className="">
                    <h1 className="text-1xl font-extrabold text-gray-900 text-center">::Current User Details::</h1>
                    
                  </div>
                  <div className="block text-center px-5 py-2.5 mr-2 mb-2 text-sm h-12 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-900 focus:outline-none dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-400 ">
                  {user?.name} :: {user?.roleName}
                  </div>
                
                </div>
              </div>
              <div className="w-full">
                <div className="flex space-x-4">
                  <button
                    className={`py-2 px-4 ${
                      activeTab === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => handleTabClick(1)}
                  >
                    To be Tested
                  </button>
                  <button
                    className={`py-2 px-4 ${
                      activeTab === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => handleTabClick(2)}
                  >
                    My Tested
                  </button>
                </div>
                {activeTab === 1 && <div>
                  {/* Table start */}
              <div>
                <div className="text-black">Untested contents</div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Serial No.
                        </th>
                        {/* <th scope="col" className="px-6 py-3">
                          Role ID.
                        </th> */}
                        <th scope="col" className="px-6 py-3">
                          Developer Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Devloper Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                          VNF Hash
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Accept
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Reject
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockData.map((item,index) => (
                        <tr
                          key={index}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <th scope="row" className="px-6 py-4 ">
                            {item.devId}
                          </th>
                          {/* <th scope="row" className="px-6 py-4 ">
                            {item.roleId}
                          </th> */}
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item.devName}
                          </td>
                          <td className="px-6 py-4">{item.devAddress}</td>
                          <td className="px-6 py-4">{item.ipfsHash}</td>
                          <td className="px-6 py-4">                       
                            <Link
                            target="_blank"
                            download
                              href={`https://gateway.pinata.cloud/ipfs/${item.ipfsHash}`}
                              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            >
                              View 
                            </Link>

                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => AcceptTestUploadBlockchain(item.ipfsHash)}
                              className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
                            >
                              Accept
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => RejectTestUploadBlockchain(item.ipfsHash)}
                              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <nav
                    className="flex items-center justify-between pt-4"
                    aria-label="Table navigation"
                  >
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      Showing{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        1-5
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        1000
                      </span>
                    </span>
                    <ul className="inline-flex -space-x-px text-sm h-8">
                      <li>
                        <a
                          href="#"
                          className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          Previous
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          aria-current="page"
                          className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                        >
                          1
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          2
                        </a>
                      </li>
                      {/* Add more pagination links here */}
                      <li>
                        <a
                          href="#"
                          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          Next
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              {/* Table End */}
              </div>}
                {activeTab === 2 && <div>  {/* Table start */}
              <div>
                <div className="text-black">My Tested contents</div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        {/* <th scope="col" className="px-6 py-3">
                          Serial No.
                        </th> */}
                        <th scope="col" className="px-6 py-3">
                          Developer Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Developer Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          VNF Hash
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockData.map((item) => (
                        <tr
                          key={item.devId}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          {/* <th scope="row" className="px-6 py-4 ">
                            {item.id}
                          </th> */}
                          
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item.devAddress}
                          </td>
                          <td className="px-6 py-4">{item.devName}</td>
                          <td className="px-6 py-4">{item.ipfsHash}</td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <nav
                    className="flex items-center justify-between pt-4"
                    aria-label="Table navigation"
                  >
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      Showing{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        1-5
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        
                      </span>
                    </span>
                    <ul className="inline-flex -space-x-px text-sm h-8">
                      <li>
                        <a
                          href="#"
                          className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          Previous
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          aria-current="page"
                          className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                        >
                          1
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          2
                        </a>
                      </li>
                      {/* Add more pagination links here */}
                      <li>
                        <a
                          href="#"
                          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          Next
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              {/* Table End */}</div>}
              </div>
              
            
            </div>
          </section>
        </Container>
      </Layout>
    </>
  );
}