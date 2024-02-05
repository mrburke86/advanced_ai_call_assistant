// frontend\components\chat\ChatInput.

import { FC, HTMLAttributes } from "react";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}

const ChatInput: FC<ChatInputProps> = () => {
  return (
    <div>
      <div>
        <textarea></textarea>
      </div>
    </div>
  );
};
