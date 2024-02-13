"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/utils/interfaces";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { userData } from "@/utils/users";
import Layout from "@/components/common/Layout";
import { Container } from "react-bootstrap";
import Link from "next/link";
import Web3 from "web3";

const contractAddress = '0xF570BaF61D48d7F767135Df9b25013B29bb0bbf1';
const localUrl = 'http://localhost:8545'
interface BlockData 
  { roleId: any; testId: any; testName: any; ipfsHash: any;  testResult: any; testAddress: any}



export default function Reviewer() {
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tabNumber: React.SetStateAction<number>) => {
    setActiveTab(tabNumber);
  };

  const router = useRouter();
  // const [user, setUser] = React.useState<UserData | null>(null);
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid");
  const [isUser, setIsUser] = React.useState(false);
  const [user, Setuser] = React.useState<UserData | null>(null);


  const fetchTesterDataByRoleId = async (roleId: string) => {
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
                ["string","string","string", "string", "string", "string"],
                transaction.input as string
              );

              // Check if the roleId matches the desired roleId
              if (decodedData[0] === roleId) {
                blocks.push({
                  roleId: decodedData[0] as string,
                  testId: decodedData[1] as string,
                  testName: decodedData[2] as string,
                  ipfsHash: decodedData[3] as string,
                  testAddress: decodedData[4] as string,
                  testResult: decodedData[5] as string,
                 
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
    const roleIdToFetch = "0"; // Replace with the desired roleId
    fetchTesterDataByRoleId(roleIdToFetch);
  }, []);
  


  // Access the user from the query parameters
  const [blockData, setBlockData] = useState<BlockData[]>([]); 

  const [blockUpload, setBlockUplaod] = useState({
    roleId : "",
    revId : "",
    revName : "",
    ipfsHash : "",
    revResult : "",
    reviewerAddress: ""
  })
  
    
  const AcceptReviewUploadBlockchain = async (hash: string) => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
      const randomId = Math.floor(Math.random() * 100).toString();
      const id = Math.floor(Math.random() * 100).toString();
      console.log("id : ",id);

      // Update state with the relevant information
      setBlockUplaod({
        roleId: user?.role as string,
        revId: id.toString(),
        revName: user?.name as string,
        ipfsHash: hash as string,
        revResult: "true", //Assuming the test result is set to "true"
        reviewerAddress: user?.ethadd as string,
      });

      const dataToUpload = web3.eth.abi.encodeParameters(
        ['string','string', 'string', 'string', 'string', 'string' ],
        [
     
          // random id
          user?.role as string,
          id,
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
      window.alert('Reviewer Accepted');

    } catch (error) {
      console.error('Error uploading data to the Ethereum blockchain:', error);
    }
  };

    const RejectReviewUploadBlockchain = async (hash: string) => {
      try {
        const web3 = new Web3(new Web3.providers.HttpProvider(localUrl));
        const randomId = Math.floor(Math.random() * 100).toString();
        const id = Math.floor(Math.random() * 100).toString();
        console.log("id : ",id);
  
        // Update state with the relevant information
        setBlockUplaod({
          roleId: user?.role as string,
          revId: id.toString(),
          revName: user?.name as string,
          ipfsHash: hash as string,
          revResult: "false", //Assuming the test result is set to "false"
          reviewerAddress: user?.ethadd as string,
        });

        const dataToUpload = web3.eth.abi.encodeParameters(
          ['string','string', 'string', 'string', 'string', 'string'],
          [
       
            // random id
            user?.role as string,
            id,
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
        window.alert('Reviewer Rejected');
  
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
    //  fetchBlockData();
  }, [userid]);



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
                
  //                 ["string","string", "string","string", "string", "string"],
  //               transaction.input as string
  //             );
  
  //             console.log(decodedData);
  
  //             blocks.push({
  //               roleId: decodedData[0] as string,
  //               testId: decodedData[1] as string, // Ensure id is converted to a string if it's a number
  //               testName: decodedData[2] as string,
  //               ipfsHash: decodedData[3] as string,
  //               testAddress: decodedData[4] as string,
  //               testResult: decodedData[5] as string,
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
                  Reviewer Dashboard
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
                    To be Reviewed
                  </button>
                  <button
                    className={`py-2 px-4 ${
                      activeTab === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => handleTabClick(2)}
                  >
                    My Reviewed
                  </button>
                </div>
                {activeTab === 1 && <div>
                  {/* Table start */}
              <div>
                <div className="text-black">Unreviewed contents</div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Serial No.
                        </th>
                        {/* <th scope="col" className="px-6 py-3">
                         Role ID
                        </th> */}
                        <th scope="col" className="px-6 py-3">
                          Tester name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Tester Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                          VNF Hash
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                        <th scope="col" className="px-6 py-3">
                        Test Result
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
                            {item.testId}
                          </th>
                          {/* <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item.roleId}
                          </td> */}
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item.testName}
                          </td>
                          <td className="px-6 py-4">{item.testAddress}</td>
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
                          <td className="px-6 py-4">{item.testResult}</td>
                          <td className="px-6 py-4">
                          <button
                              onClick={() => AcceptReviewUploadBlockchain(item.ipfsHash)}
                              className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
                            >
                              Accept
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => RejectReviewUploadBlockchain(item.ipfsHash)}
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
                <div className="text-black">My Reviewed contents</div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Serial No.
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Tester Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          VNF Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Test Result
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData2.map((item) => (
                        <tr
                          key={item.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <th scope="row" className="px-6 py-4 ">
                            {item.serialno}
                          </th>
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item.devdetails}
                          </td>
                          <td className="px-6 py-4">{item.vnfname}</td>
                          <td className="px-6 py-4">{item.vnfhash}</td>
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
              {/* Table End */}</div>}
              </div>
              
            
            </div>
          </section>
        </Container>
      </Layout>
    </>
  );
}

const tableData = [
  {
    id: 1,
    serialno: "1",
    devdetails: "Panchanan",
    vnfname: "VNF1",
    vnfhash: "$sdasdcjhjhjj454j6665b56j5sd",
  },
  {
    id: 2,
    serialno: "2",
    devdetails: "Jahnabi",
    vnfname: "VNF2",
    vnfhash: "$6k7n6k7ujbjk78ikj79bkjjhkhj",
  },
  {
    id: 3,
    serialno: "3",
    devdetails: "Amit",
    vnfname: "VNF3",
    vnfhash: "$asdasd6n57n5kjn7k6nkjnuk6n8as",
  },
];

const tableData2 = [
  {
    id: 1,
    serialno: "1",
    devdetails: "Anowar",
    vnfname: "VNF4",
    vnfhash: "$hsdrnjb567b5j6b7j6b8j6vbghfdghv",
  },
  {
    id: 2,
    serialno: "2",
    devdetails: "Ujjal",
    vnfname: "VNF5",
    vnfhash: "$sada4t56jhb567jyn7jn6j4767sdsadsdds",
  },
];