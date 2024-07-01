// //
// "use client";
// import React, { useContext, useEffect } from "react";
// import { MessagesContext } from "@/context/messages";

// export const LogMessagesContext = () => {
//   const context = useContext(MessagesContext);

//   useEffect(() => {
//     console.log("MessagesContext has changed:", context);
//   }, [context]); // This effect will run whenever the context changes

//   return null; // This component doesn't render anything
// };

// // Include <LogMessagesContext /> somewhere inside your component tree that is a child of <MessagesProvider>
