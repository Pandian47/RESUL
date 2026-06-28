import { GET_UNREAD_COUNT, baseURL } from 'Constants/EndPoints';
import { HELP } from 'Constants/GlobalConstant/Placeholders';
import { memo } from 'react';
import { useDispatch } from 'react-redux';
/** Help link — loads Http + EndPoints only when the user clicks. */
const FooterHelpLink = ({ departmentId, clientId, userId }) => {
    const dispatch = useDispatch();

    const handleHelpClick = async () => {
        try {
            const [{ default: request }, endpoints] = await Promise.all([
                import('Utils/Http'),
                import('Constants/EndPoints'),
            ]);

            let httpStatusCode = null;

            await dispatch(
                post({
                    url: GET_UNREAD_COUNT,
                    payload: { departmentId, clientId, userId },
                    loading: false,
                    ok: (req) => {
                        httpStatusCode = req.status;
                    },
                    fail: (err) => {
                        httpStatusCode = err.response?.status || err.status || 402;
                    },
                }),
            );

            if (httpStatusCode !== 401) {
                const token = localStorage.getItem('accessToken');
                const jwtToken = localStorage.getItem('jwtToken');
                if (token) {
                    window.open(
                        `https://doc.resulticks.com/?jwt=${token}${jwtToken}&base=${window.btoa(baseURL)}`,
                        '_blank',
                    );
                }
            }
        } catch {
            // Help doc open is best-effort
        }
    };

    return <li onClick={handleHelpClick}>{HELP}</li>;
};

export default memo(FooterHelpLink);
