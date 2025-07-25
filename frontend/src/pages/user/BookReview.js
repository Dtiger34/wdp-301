// import useParams để lấy bookId từ URL
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BookReview = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/reviews",
        { bookId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackOpen(true);
      setRating(0);
      setComment("");
      setTimeout(() => navigate(`/view-book/${bookId}`), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    }
  };
