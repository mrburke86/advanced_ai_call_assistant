// // frontend\lib\hooks\useMessageMutation.ts
// // frontend\lib\hooks\useMessageMutation.ts
// import { useMutation } from '@tanstack/react-query';

// export function useMessageMutation() {
//   const mutation = useMutation((newMessage: Message) => {
//     // Example async operation, replace URL and body as necessary
//     return fetch("/api/processMessage", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(newMessage),
//     }).then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     });
//   });

//   return mutation;
// }
