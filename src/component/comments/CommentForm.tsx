interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  placeholder?: string;
  submitButtonText?: string;
}